"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { statusesTypes } from "../types/statuses-types";
import { CircleHelp, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

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

function getAccessionNumber(studyUuid: string): string {
  if (!studyUuid) return "";
  const parts = studyUuid.split(".");
  return parts[parts.length - 2] || "";
}

// Definir las columnas ocultas por defecto
export const defaultHiddenColumns: Record<string, boolean> = {
  patient_code: false, // false significa oculto
  study_id: false, // false significa oculto
};

export const columns: ColumnDef<Study>[] = [
  {
    id: "patient_code", // Agregar id explícito
    accessorKey: "patient_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código de paciente" />
    ),
    cell: ({ row }) => <div>{row.getValue("patient_code")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "study_id", // Agregar id explícito
    accessorKey: "study_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID de estudio" />
    ),
    cell: ({ row }) => <div>{row.getValue("study_id")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "study_uuid",
    accessorKey: "study_uuid",
    enableHiding: true,
    enableSorting: true,
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Accession Number" />
    ),
    cell: ({ row }) => {
      const accessionNumber = getAccessionNumber(row.getValue("study_uuid"));
      return <div>{accessionNumber}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const studyUuid = row.getValue(columnId) as string;
      if (!studyUuid) return false;
      const accessionNumber = getAccessionNumber(studyUuid);
      return accessionNumber
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
  },
  // {
  //   id: "study_uuid",
  //   accessorKey: "study_uuid",
  //   enableHiding: true,
  //   enableSorting: false,
  //   enableColumnFilter: true,
  //   size: 0,
  //   minSize: 0,
  //   maxSize: 0,
  //   header: () => null,
  //   cell: () => null,
  //   filterFn: (row, columnId, filterValue) => {
  //     if (!filterValue) return true;
  //     const studyUuid = row.getValue(columnId) as string;
  //     if (!studyUuid) return false;
  //     const accessionNumber = getAccessionNumber(studyUuid);
  //     return accessionNumber
  //       .toLowerCase()
  //       .includes(String(filterValue).toLowerCase());
  //   },
  // },
  {
    accessorKey: "arrived_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de recepción" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("arrived_at"));
      // i want to format to dd-mm-yyyy hh:mm:ss
      const formattedDate = date.toLocaleString("es-CL", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      return <div>{formattedDate}</div>;
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
      // i want to format to dd-mm-yyyy hh:mm:ss with 24 hours format
      const formattedDate = date.toLocaleString("es-CL", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      return <div>{formattedDate}</div>;
    },
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
              <CircleX className="mr-2 h-4 w-4" />
              Desconocido
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge
            variant={status.variant}
            className={cn(
              status.color === "warning" && "border-yellow-500",
              status.color === "default" && "border",
            )}
          >
            {status.icon && (
              <status.icon
                className={
                  (cn(
                    status.color === "warning" && "text-yellow-500",
                    status.color === "default" && "text-muted-foreground",
                  ),
                  "mr-2 h-4 w-4")
                }
              />
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
  // {
  //   id: "actions",
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
];
