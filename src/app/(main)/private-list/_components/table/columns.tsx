"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "./data-table-row-action";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Series = {
  series_id: number;
  series_name: string;
  series_uuid: string;
  series_status: string;
  study_id: number;
  study_uuid: string;
  patient_code: string;
};

export const columns: ColumnDef<Series>[] = [
  {
    accessorKey: "patient_code",
    // header: "Accession Number",
    header: "Patient Code",
  },
  {
    accessorKey: "study_id",
    header: "Study ID",
  },
  // {
  //   accessorKey: "study_uuid",
  //   header: "Study UUID",
  // },
  {
    accessorKey: "series_id",
    header: "Serie ID",
  },
  {
    accessorKey: "series_name",
    header: "Serie Name",
  },
  // {
  //   accessorKey: "serie_uuid",
  //   header: "Serie UUID",
  // },
  {
    accessorKey: "series_status",
    header: "Status",
  },
  {
    id: "actions",
    header: "Acciones",
    accessorKey: "actions",

    cell: ({ row }) => {
      // const serie = row.original;

      return <DataTableRowActions row={row} />;
    },
  },
];
