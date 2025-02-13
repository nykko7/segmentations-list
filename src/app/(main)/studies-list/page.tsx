import { unstable_noStore as noStore } from "next/cache";

import { api } from "@/trpc/server";
import { PageHeader } from "../_components/PageHeader";
import { columns, type Study } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default async function StudiesListPage() {
  noStore();

  const medicalChecks = await api.medicalCheck.getAllPublic.query();

  console.log("medicalChecks", medicalChecks);

  const studies = medicalChecks
    .reduce((acc: Study[], medicalCheck) => {
      medicalCheck.studies.forEach((study) => {
        acc.push({
          study_id: study.id,
          study_uuid: study.uuid,
          study_name: study.name,
          study_status:
            study.uuid === "1.3.51.0.1.1.172.19.3.128.2882759.2882698"
              ? "200"
              : study.status
                ? study.status.toString()
                : "null",
          patient_code: medicalCheck.code,
          arrived_at: study.arrived_at ?? "",
          segmentation_loaded_at: study.segmentation_loaded_at ?? "",
          series: study.series,
        });
      });
      return acc;
    }, [])
    .sort((a, b) => {
      return a.study_status === "200" ? -1 : 1;
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
