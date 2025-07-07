"use server";

import type * as z from "zod";

import { db } from "@/server/db";
import { userRegisterSchema, users } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { Scrypt } from "lucia";
import { getUserByEmail, registerUser } from "../keycloak/utils";

export const register = async (values: z.infer<typeof userRegisterSchema>) => {
  const validatedFields = userRegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "Los campos son inválidos",
    };
  }

  const { email, password, name, lastName, roles } = validatedFields.data;

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

  // Check Keycloak for existing user, but don't fail if the check fails
  try {
    const existingUserKc = await getUserByEmail(email);

    if (existingUserKc) {
      return {
        error: "El usuario ya existe en Keycloak",
      };
    }
  } catch (error) {
    console.warn(
      "Could not check Keycloak for existing user, proceeding with registration:",
      error,
    );
    // Continue with registration even if Keycloak check fails
  }

  // const newUserId = generateId(21);
  const userName = `${email.split("@")[0]}`;

  const newKeycloakUser = await registerUser(
    userName,
    password,
    name,
    lastName,
    email,
    roles?.length > 0 ? roles : ["RADIOLOGIST"],
  );

  await db.insert(users).values({
    id: newKeycloakUser.id,
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
