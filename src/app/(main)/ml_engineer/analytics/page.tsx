import { PageHeader } from "../../_components/PageHeader";

export default async function Home() {
  return (
    <>
      <PageHeader
        title="Analíticas de ML"
        description="Analíticas de Machine Learning"
        // rightComponent={}
      />
      <section>{/* <DataTable columns={columns} data={users} /> */}</section>
    </>
  );
}
