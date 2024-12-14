"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { statusesTypes } from "../types/statuses-types";
import { CircleHelp } from "lucide-react";

export type Study = {
  study_id: number;
  study_name: string;
  study_uuid: string;
  study_status: string | null;
  patient_code: string;
  series: {
    id: number;
    name: string;
    uuid: string;
    status: number;
    orthanc_uuid: string;
  }[];
  arrived_at: string;
  segmentation_loaded_at: string;
};

export const columns: ColumnDef<Study>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "arrived_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de recepción" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("arrived_at"));
      return <div>{date.toLocaleString("sv-SE", { timeZone: "UTC" })}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "segmentation_loaded_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de segmentación" />
    ),
    cell: ({ row }) => {
      if (!row.getValue("segmentation_loaded_at")) {
        return <div>-</div>;
      }

      const date = new Date(row.getValue("segmentation_loaded_at"));
      return <div>{date.toLocaleString("sv-SE", { timeZone: "UTC" })}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "patient_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código de paciente" />
    ),
    cell: ({ row }) => <div>{row.getValue("patient_code")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "study_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID de estudio" />
    ),
    cell: ({ row }) => <div>{row.getValue("study_id")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  // {
  //   accessorKey: "study_name",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Study Name" />
  //   ),
  //   cell: ({ row }) => <div>{row.getValue("study_name")}</div>,
  //   enableSorting: true,
  //   enableHiding: true,
  // },
  {
    accessorKey: "study_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = statusesTypes.find(
        (status) => status.value === row.getValue("study_status"),
      );

      if (!status) {
        return (
          <div className="flex w-[100px] items-center">
            <Badge variant="outline">
              <CircleHelp className="mr-2 h-4 w-4 text-muted-foreground" />
              Desconocido
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant={status.variant}>
            {status.icon && (
              <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            {status.label}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value: string) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
