import { type Option } from "@/components/ui/multiple-selector";
import { PageHeader } from "../../_components/PageHeader";

export default async function Home() {
  const OPTIONS: Option[] = [
    { label: "nextjs", value: "Nextjs" },
    { label: "React", value: "react" },
    { label: "Remix", value: "remix" },
    { label: "Vite", value: "vite" },
    { label: "Nuxt", value: "nuxt" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Angular", value: "angular" },
    { label: "Ember", value: "ember", disable: true },
    { label: "Gatsby", value: "gatsby", disable: true },
    { label: "Astro", value: "astro" },
  ];

  return (
    <>
      <PageHeader
        title="Lista de usuarios"
        description="Gestiona los usuarios de tu plataforma"
        // rightComponent={}
      />
      <section>{/* <DataTable columns={columns} data={users} /> */}</section>
    </>
  );
}
