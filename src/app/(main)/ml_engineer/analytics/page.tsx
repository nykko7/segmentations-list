import { unstable_noStore as noStore } from "next/cache";
import { api } from "@/trpc/server";
import { PageHeader } from "../../_components/PageHeader";
import { ArrivedExamsChart } from "./_components/ArrivedExamsChart";
import { SegmentationLoadedChart } from "./_components/SegmentationLoadedChart";
import { MedicalCheck } from "@/server/db/schema";

export default async function ML_Analytics_Page() {
  // noStore();

  const medicalChecks = await api.medicalCheck.getAllPublic.query();

  // Process data for charts
  const arrivedExamsData = processArrivedExamsData(medicalChecks);
  const segmentationLoadedData = processSegmentationLoadedData(medicalChecks);

  return (
    <>
      <PageHeader title="Analíticas" />
      <div className="grid gap-6 md:grid-cols-2">
        <ArrivedExamsChart data={arrivedExamsData} />
        <SegmentationLoadedChart data={segmentationLoadedData} />
      </div>
    </>
  );
}

function processArrivedExamsData(medicalChecks: MedicalCheck[]) {
  // Group exams by date and count
  const groupedData = medicalChecks.reduce(
    (acc: Record<string, number>, check) => {
      const date = check.arrivedAt
        ? new Date(check.arrivedAt).toISOString().split("T")[0]!
        : "";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {},
  );

  // Convert to array of objects sorted by date
  return Object.entries(groupedData)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function processSegmentationLoadedData(medicalChecks: MedicalCheck[]) {
  // Group segmentations by date and count
  const groupedData = medicalChecks.reduce(
    (acc: Record<string, number>, check) => {
      if (check.segmentationLoadedAt) {
        const date = new Date(check.segmentationLoadedAt)
          .toISOString()
          .split("T")[0]!;
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  // Convert to array of objects sorted by date
  return Object.entries(groupedData)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
