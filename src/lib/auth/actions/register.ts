"use server";

import type * as z from "zod";

import { db } from "@/server/db";
import { userRegisterSchema, users } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { Scrypt, generateId } from "lucia";

export const register = async (values: z.infer<typeof userRegisterSchema>) => {
  const validatedFields = userRegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "Los campos son inválidos",
    };
  }

  const { email, password, name, lastName } = validatedFields.data;

  const hashedPassword = await new Scrypt().hash(password);

  const existingUser = await api.user.getUserByEmail.query({ email });

  if (existingUser) {
    if (!existingUser.password) {
      return {
        error: "El usuario ya existe. Debes iniciar sesión con Google o GitHub",
      };
    } else {
      return {
        error: "El usuario ya existe",
      };
    }
  }

  const newUserId = generateId(21);

  await db.insert(users).values({
    id: newUserId,
    email,
    name,
    lastName,
    password: hashedPassword,
  });

  // const verificationToken = await api.tokens.generateVerificationToken.mutate({
  //   userId: newUserId,
  //   email,
  //   type: "emailVerification",
  //   expiresTimeInHours: 24,
  // });

  // await sendVerificationEmail({
  //   email: verificationToken.email,
  //   token: verificationToken.token,
  // });

  // return {
  //   success:
  //     "Se ha enviado un correo de verificación. Revisa tu bandeja de entrada",
  // };

  return {
    success: "Te has registrado correctamente. Inicia sesión para continuar",
  };
};
