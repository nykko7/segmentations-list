import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type MedicalCheck } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const medicalCheckRouter = createTRPCRouter({
  getAllPublic: publicProcedure.query(async ({}) => {
    const res = await fetch(
      "https://segmai.scian.cl/gateway_api/segmentation_manager/segmentation_assistant/medical_checks",
    );

    if (!res.ok) {
      throw new Error("Failed to fetch medical checks");
    }

    const data = (await res.json()) as Omit<
      MedicalCheck,
      "arrivedAt" | "segmentationLoadedAt"
    >[];

    const medicalChecks: MedicalCheck[] = data.map((check) => {
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      return {
        ...check,
        studies: check.studies.map((study) => {
          const studyBaseDate = new Date(
            ninetyDaysAgo.getTime() +
              Math.random() * (now.getTime() - ninetyDaysAgo.getTime()),
          );

          const daysToAdd = study.id * 10;
          const studyDate = new Date(studyBaseDate);
          studyDate.setDate(studyDate.getDate() + daysToAdd);

          return {
            ...study,
            arrived_at: studyDate.toISOString(),
            segmentation_loaded_at:
              Math.random() < 0.5
                ? new Date(
                    studyDate.getTime() + 24 * 60 * 60 * 1000,
                  ).toISOString()
                : null,
          };
        }),
      };
    });

    return medicalChecks;
  }),

  getAllPrivate: protectedProcedure.query(async ({ ctx }) => {
    const res = await fetch(
      "https://segmai.scian.cl/gateway_api/core/api/v1/segmentation_assistant/medical_checks",
      {
        headers: ctx.headers,
        cache: "no-cache",
      },
    );

    const keycloak = ctx.session.keycloak;

    const accessTokenExpiresMsLeft =
      new Date(keycloak.accessTokenExpiresAt).getTime() - Date.now();

    const refreshTokenExpiresMsLeft =
      new Date(keycloak.refreshTokenExpiresAt).getTime() - Date.now();

    console.log(
      "Access token expires in: ",
      accessTokenExpiresMsLeft / 1000,
      "seconds",
    );

    console.log(
      "Refresh token expires in: ",
      refreshTokenExpiresMsLeft / 1000,
      "seconds",
    );

    if (!res.ok) {
      console.log(res.status);
      console.log(res.statusText);
      if (res.status === 401 || res.status === 403) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      throw new Error("Failed to fetch medical checks");
    }

    const data: MedicalCheck[] = await res.json();
    const segmentationLoadedAt = new Date();

    return (data as MedicalCheck[]).map((check) => ({
      ...check,
      // arrivedAt: check.arrivedAt ? new Date(check.arrivedAt) : undefined,
      // segmentationLoadedAt,
    }));
  }),
});
