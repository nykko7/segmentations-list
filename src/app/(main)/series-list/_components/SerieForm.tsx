"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  insertSerieParams,
  type NewSerieParams,
  type Serie,
} from "@/server/db/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type z } from "zod";

type Props = {
  serie?: Serie;
  closeModal: () => void;
};

const SerieForm = ({ serie, closeModal }: Props) => {
  const editing = !!serie?.series_id;

  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof insertSerieParams>>({
    resolver: zodResolver(insertSerieParams),
    defaultValues: serie ?? {},
    // mode: "onBlur",
  });

  // const { isValid } = form.formState;

  // const onSuccess = async (action: "create" | "update" | "delete") => {
  //   const actionMessage = {
  //     create: "creado",
  //     update: "actualizado",
  //     delete: "eliminado",
  //   }[action];

  //   await utils.series.getAll.invalidate();
  //   router.refresh();
  //   closeModal();
  //   toast.success("🚀 Operacion exitosa", {
  //     description: `Curso ${actionMessage} correctamente`,
  //   });
  // };

  // const { mutate: createSerie, isLoading: isCreating } =
  //   api.series.createSerie.useMutation({
  //     onSuccess: () => onSuccess("create"),
  //   });

  // const { mutate: updateSerie, isLoading: isUpdating } =
  //   api.series.updateSerie.useMutation({
  //     onSuccess: () => onSuccess("update"),
  //   });

  // const onSubmit = (values: NewSerieParams) => {
  //   if (editing) {
  //     updateSerie({ ...values, id: serie.serie_id });
  //   } else {
  //     createSerie(values);
  //   }
  // };

  const onSubmit = (values: NewSerieParams) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-8"}>
        <FormField
          control={form.control}
          name="series_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la serie</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Álgebra lineal" />
              </FormControl>
              <FormDescription>Nombre de la serie en estudio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant={"outline"}
            onClick={() => closeModal()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            // disabled={isCreating || isUpdating || !isValid}
            // disabled={isCreating || isUpdating}
          >
            {/* {editing
              ? `Edita${isUpdating ? "ndo..." : "r"}`
              : `Crea${isCreating ? "ndo..." : "r"}`} */}
            Editar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SerieForm;
