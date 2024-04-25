"use server";

import type * as z from "zod";

import { db } from "@/server/db";
import { userIdSchema, users } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { eq } from "drizzle-orm";
import { deleteUser as deleteUserFromKc } from "../keycloak/utils";

export const deleteUser = async (id: z.infer<typeof userIdSchema>) => {
  const validatedFields = userIdSchema.safeParse(id);

  if (!validatedFields.success) {
    return {
      error: "Los campos son inválidos",
    };
  }

  const { id: userId } = validatedFields.data;

  const existingUser = await api.user.getUserById.query({ id: userId });

  if (!existingUser?.email) {
    return {
      error: "El usuario no existe",
    };
  }

  await db.delete(users).where(eq(users.id, userId));

  await deleteUserFromKc(userId);
};
