import { api } from "@/trpc/server";
import { unstable_noStore as noStore } from "next/cache";
import { PageHeader } from "../../_components/PageHeader";

export default async function UsersListPage() {
  noStore();
  const users = await api.user.getAll.query();

  return (
    <>
      <PageHeader
        title="Lista de usuarios"
        description="Gestiona los usuarios de la plataforma"
        // rightComponent={}
      />
      <section>
        {/* <DataTable columns={columns} data={users} /> */}
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <p>{user.email}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
