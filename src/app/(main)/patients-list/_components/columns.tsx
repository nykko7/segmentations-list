"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { statusesTypes } from "../types/statuses-types";
import { CircleX } from "lucide-react";
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
  arrived_at: string;
  segmentation_loaded_at: string | null;
  series: Array<{
    series_instance_uid: string;
    series_name: string;
    body_region: string;
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

export type Patient = {
  patient_code: string;
  studies: Study[];
};

function getAccessionNumber(studyUuid: string): string {
  if (!studyUuid) return "";
  const parts = studyUuid.split(".");
  return parts[parts.length - 2] || "";
}

export const columns: ColumnDef<Patient>[] = [
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
    accessorKey: "studies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad de estudios" />
    ),
    cell: ({ row }) => {
      const studies: Study[] = row.getValue("studies");
      return <div>{studies.length}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "latest_study",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Último estudio" />
    ),
    cell: ({ row }) => {
      const studies: Study[] = row.getValue("studies");
      const latestStudy = studies.reduce(
        (latest, current) => {
          if (!latest) return current;
          return new Date(current.arrived_at) > new Date(latest.arrived_at)
            ? current
            : latest;
        },
        null as Study | null,
      );

      if (!latestStudy) return <div>-</div>;

      const date = new Date(latestStudy.arrived_at);
      return (
        <div>
          {date.toLocaleDateString("es-CL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    id: "pending_studies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estudios pendientes" />
    ),
    cell: ({ row }) => {
      const studies: Study[] = row.getValue("studies");
      const pendingStudies = studies.filter(
        (study) =>
          study.study_status === "not_reviewed" ||
          study.study_status === "created" ||
          study.study_status === "processing",
      );

      const status = statusesTypes.find(
        (status) => status.value === "not_reviewed",
      );

      if (!status) {
        return (
          <Badge variant="outline">
            <CircleX className="mr-2 h-4 w-4" />
            {pendingStudies.length}
          </Badge>
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
            {pendingStudies.length}
          </Badge>
        </div>
      );
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
];
