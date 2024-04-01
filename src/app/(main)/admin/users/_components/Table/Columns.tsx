"use client";

import { type User } from "@/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "./DataTableRowAction";

export const columns: ColumnDef<User>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Título",
    accessorKey: "title",
  },
  // Agrega aquí otras columnas necesarias...
  {
    id: "actions",
    header: "Acciones",
    accessorKey: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return <DataTableRowActions row={user} />;
    },
  },
];
