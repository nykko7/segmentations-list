import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type MedicalCheck } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

// Helper function to generate a random date within the last 30 days
function getRandomRecentDate(): string {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  return new Date(
    ninetyDaysAgo.getTime() +
      Math.random() * (now.getTime() - ninetyDaysAgo.getTime()),
  ).toISOString();
}

// Helper function to get a random segmentation loaded date (50% chance of being null)
function getRandomSegmentationLoadedAt(): string | null {
  return Math.random() < 0.5 ? getRandomRecentDate() : null;
}

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

    // Sort the medical checks by the presence of the study with the uuid "1.3.51.0.1.1.172.19.3.128.3268319.3268258"
    const medicalChecks: MedicalCheck[] = data
      .map((check) => ({
        ...check,
        arrivedAt: getRandomRecentDate(),
        segmentationLoadedAt: getRandomSegmentationLoadedAt(),
      }))
      .sort((a, b) => {
        return a.studies.some(
          (study) => study.uuid === "1.3.51.0.1.1.172.19.3.128.3268319.3268258",
        )
          ? -1
          : 1;
      });

    console.log(
      medicalChecks.map((check) => check.studies.map((study) => study.uuid)),
    );

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
      arrivedAt: check.arrivedAt ? new Date(check.arrivedAt) : undefined,
      segmentationLoadedAt,
    }));
  }),
});
