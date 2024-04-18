import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type MedicalCheck } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const medicalCheckRouter = createTRPCRouter({
  // prefix: t.procedure.input(callable).query(async (args) => handler(args)),
  getAllPublic: publicProcedure.query(async ({}) => {
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
          Authorization: `Bearer ${ctx.session.keycloak.accessToken}`,
        },
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

    const data = (await res.json()) as MedicalCheck[];

    return data;
  }),
});
