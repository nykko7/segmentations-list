"use server";

import type * as z from "zod";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/server/db";
import { users, type userProfileSchema } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { eq } from "drizzle-orm";
import { Scrypt } from "lucia";
import { updateUser } from "../keycloak/utils";

export const updateProfile = async (
  values: z.infer<typeof userProfileSchema>,
  isAdminUpdate = false,
) => {
  const userNewPassword = values.newPassword;
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: "No estas autorizado",
    };
  }

  const dbUser = await api.user.getUserById.query({ id: values.id });

  if (!dbUser) {
    return {
      error: "No estas autorizado",
    };
  }

  if (values.newPassword && values.confirmNewPassword) {
    if (values.newPassword !== values.confirmNewPassword) {
      return {
        error: "Las contraseñas no coinciden",
      };
    }
  }

  if (!isAdminUpdate && values.newPassword && !values.password) {
    return {
      error: "Debes ingresar tu contraseña actual",
    };
  }

  if (values.password && !values.newPassword) {
    return {
      error: "Debes ingresar tu nueva contraseña",
    };
  }

  if (values.email && values.email !== dbUser.email) {
    const userWithEmail = await api.user.getUserByEmail.query({
      email: values.email,
    });

    if (userWithEmail) {
      return {
        error: "Ya existe un usuario con ese correo electrónico",
      };
    }

    //   const verificationToken = await api.tokens.generateVerificationToken.mutate(
    //     {
    //       email: values.email,
    //       userId: dbUser.id,
    //       type: "emailVerification",
    //     },
    //   );

    //   return {
    //     success:
    //       "Se ha enviado un correo electrónico para verificar tu nuevo correo electrónico",
    //     error: undefined,
    //     verificationToken,
    //   };
  }

  if (values.newPassword && values.confirmNewPassword && dbUser.password) {
    if (!isAdminUpdate && values.password) {
      const passwordsMatch = await new Scrypt().verify(
        dbUser.password,
        values.password,
      );

      if (!passwordsMatch) {
        return {
          error: "La contraseña actual es incorrecta",
        };
      }
    }

    const hashedPassword = await new Scrypt().hash(values.newPassword);

    values.password = hashedPassword;
    values.newPassword = undefined;
    values.confirmNewPassword = undefined;
  }

  if (values.roles && !values.roles.includes("RADIOLOGIST")) {
    return {
      error: "No puedes quitar el rol de radiólogo",
    };
  }

  await db
    .update(users)
    .set({
      ...values,
    })
    .where(eq(users.id, dbUser.id));

  await updateUser(
    values.id,
    values.name,
    values.lastName,
    values.email,
    userNewPassword,
    values.roles,
  );

  return {
    success: "Configuración actualizada",
  };
};
