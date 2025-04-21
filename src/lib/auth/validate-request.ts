"use server";
import "server-only";

import { lucia } from "@/lib/auth";
import type { Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

export const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const cookiesStore = await cookies();

  const sessionId = cookiesStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await lucia.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const cookiesStore = await cookies();
      cookiesStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const cookiesStore = await cookies();
      cookiesStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    console.error("Failed to set session cookie");
  }
  return result;
};

export const validateRequest = cache(uncachedValidateRequest);

export const updateSession = async ({
  sessionId,
  userId,
  newSession,
}: {
  sessionId: string;
  userId: string;
  newSession: Session;
}) => {
  await lucia.invalidateSession(sessionId);

  await lucia.createSession(userId, { ...newSession }, { sessionId });

  // const sessionCookie = lucia.createSessionCookie(session.id);
  // cookies().set(
  //   sessionCookie.name,
  //   sessionCookie.value,
  //   sessionCookie.attributes,
  // );
};
