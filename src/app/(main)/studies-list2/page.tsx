import { unstable_noStore as noStore } from "next/cache";

import { api } from "@/trpc/server";
import { PageHeader } from "../_components/PageHeader";
import { columns, Study } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default async function StudiesListPage() {
  noStore();

  const medicalChecks = await api.medicalCheck.getAllPublic.query();

  console.log("medicalChecks", medicalChecks);

  const studies = medicalChecks.reduce((acc: Study[], medicalCheck) => {
    medicalCheck.studies.forEach((study) => {
      acc.push({
        study_id: study.id,
        study_uuid: study.uuid,
        study_name: study.name,
        study_status: medicalCheck.status
          ? medicalCheck.status.toString()
          : "null",
        patient_code: medicalCheck.code,
        arrived_at: medicalCheck.arrivedAt ?? "",
        segmentation_loaded_at: medicalCheck.segmentationLoadedAt ?? "",
        series: study.series,
      });
    });
    return acc;
  }, []);

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
