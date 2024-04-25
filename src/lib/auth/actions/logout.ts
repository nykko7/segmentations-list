"use server";

import { redirects } from "@/constants";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { invalidateToken } from "../keycloak/utils";
import { validateRequest } from "../validate-request";

export const logout = async ({ redirectTo }: { redirectTo?: string }) => {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "No session found",
    };
  }
  await lucia.invalidateSession(session.id);

  // Invalidate keycloak token
  try {
    await invalidateToken(session.keycloak.refreshToken);
  } catch (e) {
    console.error("El token de keycloak no pudo ser invalidado", e);
  }
  // await invalidateToken(session.keycloak.accessToken);
  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect(redirectTo ?? redirects.afterLogout);
};
