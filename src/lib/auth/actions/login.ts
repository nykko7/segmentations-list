"use server";

import type * as z from "zod";

import { redirects } from "@/constants";
import { lucia } from "@/lib/auth";
import { userLoginSchema } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { Scrypt } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getToken } from "../keycloak/utils";

export const login = async (
  values: z.infer<typeof userLoginSchema>,
  callbackUrl?: string | null,
) => {
  const validatedFields = userLoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "Los campos son inválidos",
    };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await api.user.getUserByEmail.query({ email });

  if (!existingUser?.email) {
    return {
      error: "El usuario no existe",
    };
  }

  if (!existingUser.password) {
    return {
      error: "El usuario no tiene registrada una contraseña.",
    };
  }

  const passwordsMatch = await new Scrypt().verify(
    existingUser.password,
    password,
  );

  if (!passwordsMatch) {
    return {
      error: "Usuario o contraseña incorrectos",
    };
  }

  // if (!existingUser.emailVerified) {
  //   const verificationToken = await api.tokens.generateVerificationToken.mutate(
  //     {
  //       userId: existingUser.id,
  //       email: existingUser.email,
  //       type: "emailVerification",
  //     },
  //   );

  //   await sendVerificationEmail({
  //     email: verificationToken.email,
  //     token: verificationToken.token,
  //   });

  //   return {
  //     success:
  //       "Se ha enviado un correo de verificación. Revisa tu bandeja de entrada",
  //   };
  // }

  const keycloakToken = await getToken({
    username: existingUser.email,
    password: password,
    // username: "nperez_prueba",
    // password: "nperez",
  });

  if (!keycloakToken) {
    return {
      error: "Error al obtener token de Keycloak",
    };
  }

  const session = await lucia.createSession(existingUser.id, {
    keycloak: keycloakToken,
  });

  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect(callbackUrl ?? redirects.afterLogin);
};
