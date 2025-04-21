"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { statusesTypes } from "../types/statuses-types";
import { CircleX, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export type Study = {
  study_id: string;
  study_uuid: string;
  study_name: string;
  study_status:
    | "created"
    | "processing"
    | "partially_processed"
    | "failed"
    | "error"
    | "fully_processed"
    | "reviewed"
    | "not_reviewed";
  patient_code: string;
  arrived_at: string;
  segmentation_loaded_at: string | null;
  series: Array<{
    series_instance_uid: string;
    segmentations: Array<{
      id: string;
      created_at: string;
      updated_at: string;
      is_deleted: boolean;
      name: string;
      segmentation_id: string | null;
      orthanc_id: string;
      status: string;
      series_instance_uid: string;
      series: string;
      segments: Array<{
        id: string;
        created_at: string;
        updated_at: string;
        is_deleted: boolean;
        name: string;
        label: string;
        tracking_id: string;
        affected_organs: string;
        volume: number;
        axial_diameter: number | null;
        coronal_diameter: number | null;
        sagittal_diameter: number | null;
        lession_classification: string;
        lession_type: string;
        segmentation_type: string;
        window_width: number | null;
        window_level: number | null;
        status: string;
        lesion_segmentation: string;
        user: string | null;
        reviewed_by: string | null;
        model: string | null;
        lesion_segments: string[];
      }>;
    }>;
  }>;
  is_basal: boolean;
  related_studies_ids: string[];
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
  // {
  //   id: "patient_code", // Agregar id explícito
  //   accessorKey: "patient_code",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Código de paciente" />
  //   ),
  //   cell: ({ row }) => <div>{row.getValue("patient_code")}</div>,
  //   enableSorting: true,
  //   enableHiding: true,
  // },
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
    enableColumnFilter: true,
    header: "Accession number",
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
  //   accessorKey: "patient_code",
  //   header: "Código de paciente",
  // },
  {
    accessorKey: "arrived_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de recepción" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.original.arrived_at);
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "segmentation_loaded_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de segmentación" />
    ),
    cell: ({ row }) => {
      if (!row.original.segmentation_loaded_at) return "Pendiente";
      const date = new Date(row.original.segmentation_loaded_at);
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
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
        <div className="flex items-center">
          <Badge
            variant={status.variant}
            className={cn(
              status.color === "warning" && "border-yellow-500",
              status.color === "default" && "border",
              status.color === "success" && "border-green-500",
            )}
          >
            {status.icon && (
              <status.icon
                className={cn(
                  "mr-2 h-4 w-4",
                  status.color === "warning" && "text-yellow-500",
                  status.color === "default" && "text-muted-foreground",
                  status.color === "success" && "text-green-500",
                )}
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
