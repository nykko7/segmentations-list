import { unstable_noStore as noStore } from "next/cache";

import { api } from "@/trpc/server";
import { PageHeader } from "../_components/PageHeader";
import { columns, Study } from "./_components/columns";
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

    if (existingPatient) {
      existingPatient.studies.push(
        ...medicalCheck.studies.map((study) => ({
          id: study.id,
          uuid: study.uuid,
          name: study.name,
          status: medicalCheck.status,
          arrived_at: medicalCheck.arrivedAt ?? "",
          segmentation_loaded_at: medicalCheck.segmentationLoadedAt ?? "",
          series: study.series,
        })),
      );
    } else {
      acc.push({
        patient_code: medicalCheck.code,
        studies: medicalCheck.studies.map((study) => ({
          id: study.id,
          uuid: study.uuid,
          name: study.name,
          status: medicalCheck.status,
          arrived_at: medicalCheck.arrivedAt ?? "",
          segmentation_loaded_at: medicalCheck.segmentationLoadedAt ?? "",
          series: study.series,
        })),
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
