import { env } from "@/env";
import { invalidateToken } from "@/lib/auth/keycloak/utils";
import { type UserRole } from "@/server/db/schema";
import KcAdminClient from "@keycloak/keycloak-admin-client";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { SetRolesButton } from "./_components/set-roles-button";

// force dynamic
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TestPage = async () => {
  const kcAdminClient = new KcAdminClient();

  kcAdminClient.setConfig({
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  });

  await kcAdminClient.auth({
    username: env.KEYCLOAK_ADMIN_USERNAME,
    password: env.KEYCLOAK_ADMIN_PASSWORD,
    grantType: "password",
    clientId: env.KEYCLOAK_CLIENT_ID,
    clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    scopes: ["openid"],
  });
  let users: UserRepresentation[] = [];

  try {
    users = await kcAdminClient.users.find();
  } catch {
    console.log("error fetching users");
  }
  // const roles = await kcAdminClient.users.listAvailableRealmRoleMappings();

  await invalidateToken(kcAdminClient.refreshToken!);

  const userRoles: UserRole[] = ["ADMIN"];

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <code>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </code>
          <div>
            {user.id}-{user.firstName} {user.lastName} {user.email}
          </div>
          <div>
            Roles:
            <ul>
              {user.realmRoles?.map((role) => (
                <li key={role}>
                  <div>
                    <span>{role}</span>
                  </div>
                </li>
              ))}
              <SetRolesButton userId={user.id!} userRoles={userRoles} />
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestPage;
