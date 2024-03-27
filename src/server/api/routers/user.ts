import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
    }),

  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
    }),
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findMany();
  }),

  // getAccountByUserId: publicProcedure
  //   .input(z.object({ userId: z.string() }))
  //   .query(({ ctx, input }) => {
  //     return ctx.db.query.accounts.findFirst({
  //       where: eq(accounts.userId, input.userId),
  //     });
  //   }),
  // updateName: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     const userId = ctx.session?.user?.id;
  //     if (!userId) {
  //       throw new TRPCError({ code: "UNAUTHORIZED" });
  //     }
  //     await ctx.db
  //       .update(users)
  //       .set({
  //         name: input.name,
  //       })
  //       .where(eq(users.id, userId));
  //   }),
});
