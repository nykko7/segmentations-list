import { env } from "@/env";
import KcAdminClient from "@keycloak/keycloak-admin-client";
import { PageHeader } from "../../_components/PageHeader";
import { LoginForm } from "./_components/login-form";

export default async function ML_Analytics_Page() {
  const kcAdminClientConfig = {
    // baseUrl: env.KEYCLOAK_SERVER_URL,
    // realmName: env.KEYCLOAK_REALM,
    baseUrl: env.KEYCLOAK_SERVER_URL,
    realmName: env.KEYCLOAK_REALM,
  };

  const kcAdminClient = new KcAdminClient(kcAdminClientConfig);

  try {
    await kcAdminClient.auth({
      username: env.KEYCLOAK_ADMIN_USERNAME,
      password: env.KEYCLOAK_ADMIN_PASSWORD,
      grantType: "password",
      clientId: env.KEYCLOAK_CLIENT_ID,
      // scopes: ["openid"],
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
    });
  } catch (e) {
    console.log(e);
  }

  const users = await kcAdminClient.users.find({ first: 0, max: 10 });
  // const user = kcAdminClient.whoAmI.find();

  console.log(users);

  return (
    <>
      <PageHeader
        title="Analíticas de ML"
        description="Analíticas de Machine Learning"
        // rightComponent={}
      />
      <section>
        {/* <DataTable columns={columns} data={users} /> */}
        {/* <p>{JSON.stringify(user)}</p> */}
        <LoginForm />
        {/* <ul>
          {users.map((user) => (
            <li key={user.id}>{JSON.stringify(user)}</li>
          ))}
        </ul> */}
      </section>
    </>
  );
}
