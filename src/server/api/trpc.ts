/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getToken } from "@/lib/auth/keycloak/utils";
import {
  uncachedValidateRequest,
  updateSession,
} from "@/lib/auth/validate-request";
import { db } from "@/server/db";
import console from "console";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { session, user } = await uncachedValidateRequest();

  return {
    session,
    user,
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.session.keycloak) {
    console.error("No session or user");
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const keycloak = ctx.session.keycloak;

  const accessTokenExpiresMsLeft =
    new Date(keycloak.accessTokenExpiresAt).getTime() - Date.now();

  const refreshTokenExpiresMsLeft =
    new Date(keycloak.refreshTokenExpiresAt).getTime() - Date.now();

  console.log(
    "Access token expires in: ",
    accessTokenExpiresMsLeft / 1000,
    "seconds",
  );

  console.log(
    "Refresh token expires at: ",
    refreshTokenExpiresMsLeft / 1000,
    "seconds",
  );

  // Refresh token if it's about to expire in 30 seconds
  if (
    new Date(keycloak.accessTokenExpiresAt) < new Date(Date.now() + 1000 * 30)
  ) {
    if (
      new Date(keycloak.refreshTokenExpiresAt) <
      new Date(Date.now() + 1000 * 30)
    ) {
      console.error("Refresh token expired");
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Refresh token
    try {
      console.log("Refreshing token");
      const newToken = await getToken({
        refreshToken: keycloak.refreshToken,
        grantType: "refresh_token",
      });

      console.log("newToken", newToken);

      ctx.session.keycloak = {
        ...keycloak,
        accessToken: newToken?.accessToken ?? keycloak.accessToken,
        refreshToken: newToken?.refreshToken ?? keycloak.refreshToken,
        accessTokenExpiresAt:
          newToken?.accessTokenExpiresAt ?? keycloak.accessTokenExpiresAt,
        refreshTokenExpiresAt:
          newToken?.refreshTokenExpiresAt ?? keycloak.refreshTokenExpiresAt,
      };

      await updateSession({
        newSession: ctx.session,
        userId: ctx.user.id,
        sessionId: ctx.session.id,
      });
      console.log("Token refreshed");
    } catch (e) {
      console.error("Error refreshing token", e);
      throw new TRPCError({ code: "FORBIDDEN" });
    }
  }

  // try {
  //   await validateAccessToken(ctx.session.keycloak.accessToken);
  // } catch {
  //   throw new TRPCError({ code: "FORBIDDEN" });
  // }
  return next({
    ctx: {
      // infers the `session` and `user` as non-nullable
      session: { ...ctx.session },
      user: { ...ctx.user },
      headers: {
        ...ctx.headers,
        Authorization: `Bearer ${ctx.session.keycloak.accessToken}`,
      },
    },
  });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user?.roles.includes("ADMIN")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` and `user` as non-nullable
      session: { ...ctx.session },
      user: { ...ctx.user },
    },
  });
});
