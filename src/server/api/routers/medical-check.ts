import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type MedicalCheck } from "@/server/db/schema";

export const medicalCheckRouter = createTRPCRouter({
  // prefix: t.procedure.input(callable).query(async (args) => handler(args)),
  getAll: publicProcedure.query(async ({}) => {
    const res = await fetch(
      "https://segmai.scian.cl/gateway_api/segmentation_manager/segmentation_assistant/medical_checks",
    );
    console.log(res);

    if (!res.ok) {
      throw new Error("Failed to fetch medical checks");
    }

    const data = (await res.json()) as MedicalCheck[];

    return data;
  }),
});
