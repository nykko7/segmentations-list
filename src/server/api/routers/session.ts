import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { sessions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const sessionRouter = createTRPCRouter({
  updateKeycloakToken: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        keycloakToken: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(sessions)
        .set({
          keycloak: input.keycloakToken,
        })
        .where(eq(sessions.id, input.sessionId));
    }),
});
