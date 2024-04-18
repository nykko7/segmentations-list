import { db } from "@/server/db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users, type User as DbUser } from "../../server/db/schema";

import { env } from "@/env";
import { Lucia } from "lucia";
import { validateRequest } from "./validate-request";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getSessionAttributes: (attributes) => {
    return {
      keycloak: attributes.keycloak,
    };
  },

  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      name: attributes.name,
      lastName: attributes.lastName,
      roles: attributes.roles,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
      keycloakId: attributes.keycloakId,
    };
  },
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: env.NODE_ENV === "production",
    },
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
interface DatabaseSessionAttributes {
  keycloak: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
  };
}
interface DatabaseUserAttributes extends Omit<DbUser, "password"> {}

export const getCurrentUser = async () => {
  const session = await validateRequest();

  return session?.user;
};

export const getCurrentUserRoles = async () => {
  const { user } = await validateRequest();

  return user?.roles ?? [];
};
