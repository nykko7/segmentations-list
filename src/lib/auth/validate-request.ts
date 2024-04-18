import { lucia } from "@/lib/auth";
import type { Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

export const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await lucia.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
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

  const session = await lucia.createSession(
    userId,
    { ...newSession },
    { sessionId },
  );

  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
};
