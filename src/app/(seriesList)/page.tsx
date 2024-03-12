import { unstable_noStore as noStore } from "next/cache";

import { api } from "@/trpc/server";
import { columns, type Series } from "./_components/table/columns";
import { DataTable } from "./_components/table/data-table";

export default async function Home() {
  noStore();

  const medicalChecks = await api.medicalCheck.getAll.query();

  const series = medicalChecks.reduce((acc: Series[], medicalCheck) => {
    medicalCheck.studies.forEach((study) => {
      study.series.forEach((serie) => {
        acc.push({
          serie_id: serie.id,
          serie_name: serie.name,
          serie_uuid: serie.uuid,
          serie_status: serie.status.toString(), // Asegurándonos de que el status sea un string
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
    <main className="flex min-h-screen flex-col items-center justify-center">
      <section className="max-w-screen-lg">
        <div className="mb-3 flex items-end justify-between text-3xl font-semibold">
          <h1 className="text-3xl">Lista de estudios</h1>
          <p className="text-xl text-muted-foreground">
            {medicalCheckCount} estudios
          </p>
        </div>
        <DataTable columns={columns} data={series} />
      </section>
    </main>
  );
}
