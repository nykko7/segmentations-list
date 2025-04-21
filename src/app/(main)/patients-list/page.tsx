import { unstable_noStore as noStore } from "next/cache";

import { api } from "@/trpc/server";
import { PageHeader } from "../_components/PageHeader";
import { columns, type Study } from "./_components/columns";
import { DataTable } from "./_components/data-table";

type Patient = {
  patient_code: string;
  studies: Study[];
};

export default async function PatientsListPage() {
  noStore();

  const medicalChecks = await api.medicalCheck.getAllPublic.query();

  // Group medical checks by patient code
  const patients = medicalChecks.reduce((acc, medicalCheck) => {
    const existingPatient = acc.find(
      (p) => p.patient_code === medicalCheck.code,
    );

    const studiesData = medicalCheck.studies.map((study) => ({
      study_id: study.id,
      study_uuid: study.uuid,
      study_name: study.name,
      study_status: study.status,
      patient_code: medicalCheck.code,
      arrived_at: study.arrived_at ?? "",
      segmentation_loaded_at: study.segmentation_loaded_at ?? null,
      series: study.series.map((series) => ({
        series_instance_uid: series.series_instance_uid,
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
    }));

    if (existingPatient) {
      existingPatient.studies.push(...studiesData);
    } else {
      acc.push({
        patient_code: medicalCheck.code,
        studies: studiesData,
      });
    }
    return acc;
  }, [] as Patient[]);

  return (
    <>
      <PageHeader
        title="Lista de pacientes"
        description="Lista de pacientes y sus estudios disponibles"
      />
      <section>
        <DataTable columns={columns} data={patients} />
      </section>
    </>
  );
}
