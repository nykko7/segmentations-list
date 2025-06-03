import { unstable_noStore as noStore } from "next/cache";
import { parseAsString, createLoader } from "nuqs/server";

import { api } from "@/trpc/server";
import { PageHeader } from "../_components/PageHeader";
import { columns, type Study } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default async function StudiesListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  noStore();

  // Parse the AccessionNumber from the URL query parameters
  const searchParamsConfig = {
    AccessionNumber: parseAsString.withDefault(""),
  };
  const loadSearchParams = createLoader(searchParamsConfig);
  const { AccessionNumber: accessionNumber } =
    await loadSearchParams(searchParams);

  const medicalChecks = await api.medicalCheck.getAllPublic.query({
    accessionNumber: accessionNumber || undefined,
  });

  const studies = medicalChecks
    .reduce((acc: Study[], medicalCheck) => {
      // Filter studies if accessionNumber is provided
      const studiesToProcess = accessionNumber
        ? medicalCheck.studies.filter(
            (study) =>
              study.id.toLowerCase().includes(accessionNumber.toLowerCase()) ||
              study.uuid?.toLowerCase().includes(accessionNumber.toLowerCase()),
          )
        : medicalCheck.studies;

      studiesToProcess.forEach((study) => {
        acc.push({
          study_id: study.id,
          study_uuid: study.uuid,
          study_name: study.name,
          study_status: study.status,
          patient_code: medicalCheck.code,
          arrived_at: study.arrived_at ?? "",
          segmentation_loaded_at: study.segmentation_loaded_at ?? "",
          series: study.series.map((series) => ({
            series_instance_uid: series.series_instance_uid,
            series_name: series.series_name,
            body_region: series.body_region,
            segmentations: series.segmentations.map((segmentation) => ({
              id: segmentation.id,
              created_at: segmentation.created_at,
              updated_at: segmentation.updated_at,
              is_deleted: segmentation.is_deleted,
              name: segmentation.name,
              segmentation_id: segmentation.segmentation_id,
              orthanc_id: segmentation.orthanc_id,
              status: segmentation.status,
              series_instance_uid: segmentation.series_instance_uid,
              series: segmentation.series,
              segments: segmentation.segments.map((segment) => ({
                id: segment.id,
                created_at: segment.created_at,
                updated_at: segment.updated_at,
                is_deleted: segment.is_deleted,
                name: segment.name,
                label: segment.label,
                tracking_id: segment.tracking_id,
                affected_organs: segment.affected_organs,
                volume: segment.volume,
                axial_diameter: segment.axial_diameter,
                coronal_diameter: segment.coronal_diameter,
                sagittal_diameter: segment.sagittal_diameter,
                lession_classification: segment.lession_classification,
                lession_type: segment.lession_type,
                segmentation_type: segment.segmentation_type,
                window_width: segment.window_width,
                window_level: segment.window_level,
                status: segment.status,
                lesion_segmentation: segment.lesion_segmentation,
                user: segment.user,
                reviewed_by: segment.reviewed_by,
                model: segment.model,
                lesion_segments: segment.lesion_segments,
              })),
            })),
          })),
          is_basal: study.is_basal,
          related_studies_ids: study.related_studies_ids,
        });
      });
      return acc;
    }, [])
    .sort((a, b) => {
      // First, prioritize not_reviewed studies
      if (
        a.study_status === "not_reviewed" &&
        b.study_status !== "not_reviewed"
      )
        return -1;
      if (
        a.study_status !== "not_reviewed" &&
        b.study_status === "not_reviewed"
      )
        return 1;

      // // Then sort by basal status
      // if (a.is_basal && !b.is_basal) return -1;
      // if (!a.is_basal && b.is_basal) return 1;

      // Finally sort by arrival date
      return (
        new Date(b.arrived_at).getTime() - new Date(a.arrived_at).getTime()
      );
    });

  return (
    <>
      <PageHeader
        title="Lista de estudios"
        description="Lista de estudios disponibles para su revisión"
      />
      <section>
        <DataTable columns={columns} data={studies} />
      </section>
    </>
  );
}
