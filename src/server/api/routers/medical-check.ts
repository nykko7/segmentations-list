import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type MedicalCheck } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const medicalCheckRouter = createTRPCRouter({
  // prefix: t.procedure.input(callable).query(async (args) => handler(args)),
  getAll: publicProcedure.query(async ({}) => {
    const res = await fetch(
      "https://segmai.scian.cl/gateway_api/segmentation_manager/segmentation_assistant/medical_checks",
    );

    if (!res.ok) {
      throw new Error("Failed to fetch medical checks");
    }

    const data = (await res.json()) as MedicalCheck[];

    return data;
  }),
  getAllPrivate: protectedProcedure.query(async ({ ctx }) => {
    const res = await fetch(
      "https://segmai.scian.cl/gateway_api/core/api/v1/segmentation_assistant/medical_checks",
      {
        headers: {
          Authorization: ctx.headers.Authorization,
        },
        cache: "no-cache",
      },
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      throw new Error("Failed to fetch medical checks");
    }

    const data = (await res.json()) as MedicalCheck[];

    return data;
  }),
});
