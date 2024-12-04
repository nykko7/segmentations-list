import { unstable_noStore as noStore } from "next/cache";

import { api } from "@/trpc/server";
import { PageHeader } from "../_components/PageHeader";
import { columns, type Series } from "./_components/table/columns";
import { DataTable } from "./_components/table/data-table";

export default async function SeriesList() {
  noStore();

  const medicalChecks = await api.medicalCheck.getAllPublic.query();

  const series = medicalChecks.reduce((acc: Series[], medicalCheck) => {
    medicalCheck.studies.forEach((study) => {
      study.series.forEach((series) => {
        acc.push({
          series_id: series.id,
          series_name: series.name,
          series_uuid: series.uuid,
          series_status: series.status.toString(), // Asegurándonos de que el status sea un string
          study_id: study.id,
          study_uuid: study.uuid,
          patient_code: medicalCheck.code,
        });
      });
    });
    return acc;
  }, []);

  const medicalCheckCount = series.length;

  return (
    <>
      <PageHeader
        title="Lista de series"
        description="Lista de series disponibles para su revisión"
        rightComponent={
          <p className="text-2xl font-medium text-muted-foreground">
            {medicalCheckCount} exámenes
          </p>
        }
      />
      <section>
        <DataTable columns={columns} data={series} />
      </section>
    </>
  );
}
