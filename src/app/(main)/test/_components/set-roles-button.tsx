"use client";
import { Button } from "@/components/ui/button";
import { setUserRoles } from "@/lib/auth/keycloak/utils";
import { type UserRole } from "@/server/db/schema";

export const SetRolesButton = ({
  userId,
  userRoles,
}: {
  userId: string;
  userRoles: UserRole[];
}) => {
  return (
    <form action={() => setUserRoles(userId, userRoles)}>
      <Button type="submit">Dar Roles</Button>
    </form>
  );
};
