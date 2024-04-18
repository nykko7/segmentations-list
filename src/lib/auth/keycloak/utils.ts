import "server-only";

import { env } from "@/env";
import {
  getToken as getKeycloakToken,
  type Credentials,
  type GrantTypes,
} from "@keycloak/keycloak-admin-client/lib/utils/auth";
import { TRPCError } from "@trpc/server";

export const getToken = async ({
  username,
  password,
  refreshToken,
  grantType,
}: {
  username?: string;
  password?: string;
  refreshToken?: string;
  grantType?: GrantTypes;
}) => {
  const credentials: Credentials = {
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    grantType: grantType ?? "password",
    username: username,
    password: password,
    refreshToken: refreshToken,
  };

  try {
    const keycloakToken = await getKeycloakToken({
      credentials,
      baseUrl: env.KEYCLOAK_SERVER_URL,
      realmName: env.KEYCLOAK_REALM,
      scope: "openid",
    });

    return {
      accessToken: keycloakToken.accessToken,
      refreshToken: keycloakToken.refreshToken,
      accessTokenExpiresAt: new Date(
        Date.now() + Number(keycloakToken.expiresIn) * 1000, // Convertir segundos a milisegundos
      ),
      refreshTokenExpiresAt: new Date(
        Date.now() + Number(keycloakToken.refreshExpiresIn) * 1000, // Convertir segundos a milisegundos
      ),
    };
  } catch (error) {
    console.error("Error getting token", error);
    throw error;
  }
};

export const validateAccessToken = async (token: string) => {
  try {
    const userInfoFetch = await fetch(
      `${env.KEYCLOAK_SERVER_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-cache",
        body: new URLSearchParams({
          client_id: env.KEYCLOAK_CLIENT_ID,
          client_secret: env.KEYCLOAK_CLIENT_SECRET,
          grant_type: "client_credentials",
        }),
      },
    );
    if (!userInfoFetch.ok) {
      console.log(userInfoFetch.status);
      console.log(userInfoFetch.statusText);
      throw new TRPCError({ code: "FORBIDDEN" });
    }
  } catch (error) {
    console.error("Error validating token", error);
    throw error;
  }
};