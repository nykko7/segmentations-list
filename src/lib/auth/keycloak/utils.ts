"use server";

import { env } from "@/env";
import {
  getToken as getKeycloakToken,
  type Credentials,
  type GrantTypes,
} from "@keycloak/keycloak-admin-client/lib/utils/auth";

import { type UserRole } from "@/server/db/schema";
import KcAdminClient from "@keycloak/keycloak-admin-client";

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
    return null;
  }
};

export const invalidateToken = async (token: string) => {
  try {
    const response = await fetch(
      `${env.KEYCLOAK_SERVER_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({
          client_id: env.KEYCLOAK_CLIENT_ID,
          client_secret: env.KEYCLOAK_CLIENT_SECRET,
          refresh_token: token,
          grant_type: "client_credentials",
        }),
        cache: "no-cache",
      },
    );
    if (!response.ok) {
      console.log(response.status);
      console.log(response.statusText);
      throw new Error("Failed to invalidate session");
    }

    console.log("Session invalidated successfully");
  } catch (error) {
    console.error("Error invalidating session", error);
    throw error;
  }
};

// export const validateAccessToken = async (token: string) => {
//   try {
//     const userInfoFetch = await fetch(
//       `${env.KEYCLOAK_SERVER_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         cache: "no-cache",
//         body: new URLSearchParams({
//           client_id: env.KEYCLOAK_CLIENT_ID,
//           client_secret: env.KEYCLOAK_CLIENT_SECRET,
//           grant_type: "client_credentials",
//         }),
//       },
//     );
//     if (!userInfoFetch.ok) {
//       console.log(userInfoFetch.status);
//       console.log(userInfoFetch.statusText);
//       throw new TRPCError({ code: "FORBIDDEN" });
//     }
//   } catch (error) {
//     console.error("Error validating token", error);
//     throw error;
//   }
// };

export const registerUser = async (
  username: string,
  password: string,
  firstName: string,
  lastName: string,
  email: string,
  roles?: UserRole[],
) => {
  const keycloakAdmin = new KcAdminClient();

  keycloakAdmin.setConfig({
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  });

  try {
    await keycloakAdmin.auth({
      username: env.KEYCLOAK_ADMIN_USERNAME,
      password: env.KEYCLOAK_ADMIN_PASSWORD,
      grantType: "password",
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      scopes: ["openid"],
    });

    console.log("Keycloak admin authenticated successfully for user creation");
    console.log("Creating user:", { username, email, firstName, lastName });

    const newUser = await keycloakAdmin.users.create({
      username,
      email,
      enabled: true,
      firstName,
      lastName,
      emailVerified: true,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
    });

    console.log("User created successfully:", newUser);

    await setUserRoles(newUser.id, roles ?? []);

    await invalidateToken(keycloakAdmin.refreshToken!);

    return newUser;
  } catch (error) {
    console.error("Error in registerUser:", error);
    console.error("Failed to create user in Keycloak:", {
      username,
      email,
      baseUrl: env.KEYCLOAK_SERVER_URL,
      realm: env.KEYCLOAK_REALM,
      clientId: env.KEYCLOAK_CLIENT_ID,
      adminUsername: env.KEYCLOAK_ADMIN_USERNAME,
    });

    if (keycloakAdmin.refreshToken) {
      try {
        await invalidateToken(keycloakAdmin.refreshToken);
      } catch (invalidateError) {
        console.error("Error invalidating token:", invalidateError);
      }
    }

    throw error; // Re-throw since user creation is critical
  }
};

// get user by email
export const getUserByEmail = async (email: string) => {
  const keycloakAdmin = new KcAdminClient();

  keycloakAdmin.setConfig({
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  });

  try {
    await keycloakAdmin.auth({
      username: env.KEYCLOAK_ADMIN_USERNAME,
      password: env.KEYCLOAK_ADMIN_PASSWORD,
      grantType: "password",
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      scopes: ["openid"],
    });

    console.log("Keycloak admin authenticated successfully");
    console.log("Searching for user with email:", email);

    const user = await keycloakAdmin.users.find({
      email,
    });

    console.log("User search result:", user);

    await invalidateToken(keycloakAdmin.refreshToken!);

    return user[0] ?? null;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    console.error("Keycloak config:", {
      baseUrl: env.KEYCLOAK_SERVER_URL,
      realm: env.KEYCLOAK_REALM,
      clientId: env.KEYCLOAK_CLIENT_ID,
      adminUsername: env.KEYCLOAK_ADMIN_USERNAME,
    });

    // Don't throw the error, return null instead to allow registration to continue
    // but log the issue for debugging
    if (keycloakAdmin.refreshToken) {
      try {
        await invalidateToken(keycloakAdmin.refreshToken);
      } catch (invalidateError) {
        console.error("Error invalidating token:", invalidateError);
      }
    }

    return null;
  }
};

export const deleteUser = async (userId: string) => {
  const keycloakAdmin = new KcAdminClient();

  keycloakAdmin.setConfig({
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  });

  await keycloakAdmin.auth({
    username: env.KEYCLOAK_ADMIN_USERNAME,
    password: env.KEYCLOAK_ADMIN_PASSWORD,
    grantType: "password",
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    scopes: ["openid"],
  });

  await keycloakAdmin.users.del({ id: userId });

  await invalidateToken(keycloakAdmin.refreshToken!);

  return userId;
};

export const updateUser = async (
  userId: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  password?: string,
  roles?: UserRole[],
) => {
  const keycloakAdmin = new KcAdminClient();

  keycloakAdmin.setConfig({
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  });

  await keycloakAdmin.auth({
    username: env.KEYCLOAK_ADMIN_USERNAME,
    password: env.KEYCLOAK_ADMIN_PASSWORD,
    grantType: "password",
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    scopes: ["openid"],
  });

  // create object with roles if they are provided,and password is provided
  const updatedUser = {
    id: userId,
    firstName,
    lastName,
    email,
    credentials: password
      ? [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ]
      : undefined,
    realmRoles: roles ?? undefined,
  };

  await keycloakAdmin.users.update({ id: updatedUser.id }, { ...updatedUser });

  if (password) {
    await keycloakAdmin.users.resetPassword({
      id: updatedUser.id,
      credential: {
        temporary: false,
        type: "password",
        value: password,
      },
    });
  }

  await invalidateToken(keycloakAdmin.refreshToken!);

  return userId;
};

type KeycloakRoleNames =
  | "platform-radiologist"
  | "platform-admin"
  | "platform-ml_engineer";

type keyCloakRole = {
  id: string;
  name: KeycloakRoleNames;
};

const keycloakUserRoles: Record<UserRole, keyCloakRole> = {
  RADIOLOGIST: {
    id: "86f0d4ed-0d76-477a-b13a-75138f1de8e0",
    name: "platform-radiologist",
  },
  ADMIN: { id: "6a963ff4-350e-415a-aa0c-d5ec53e00659", name: "platform-admin" },
  ML_ENGINEER: {
    id: "ceef76b1-0ba2-4ca7-ba15-b44fca5c483c",
    name: "platform-ml_engineer",
  },
};

export const setUserRoles = async (userId: string, roles: UserRole[]) => {
  const keycloakAdmin = new KcAdminClient();

  keycloakAdmin.setConfig({
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  });

  await keycloakAdmin.auth({
    username: env.KEYCLOAK_ADMIN_USERNAME,
    password: env.KEYCLOAK_ADMIN_PASSWORD,
    grantType: "password",
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    scopes: ["openid"],
  });

  const keycloakRoles = roles.map((role) => keycloakUserRoles[role]);

  await keycloakAdmin.users.addRealmRoleMappings({
    id: userId,
    roles: keycloakRoles,
  });
  console.log("keycloakRoles", keycloakRoles);
  await invalidateToken(keycloakAdmin.refreshToken!);

  return keycloakRoles;
};
