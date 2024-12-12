"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { CircleHelp } from "lucide-react";

export type Study = {
  id: number;
  uuid: string;
  name: string;
  status: number | null;
  arrived_at: string;
  segmentation_loaded_at: string;
  series: {
    id: number;
    name: string;
    uuid: string;
    status: number;
    orthanc_uuid: string;
  }[];
};

export type Patient = {
  patient_code: string;
  studies: Study[];
};

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
      const studies = row.getValue("studies") as Study[];
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
      const studies = row.getValue("studies") as Study[];
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
      return <div>{date.toLocaleString("sv-SE", { timeZone: "UTC" })}</div>;
    },
  },
  {
    id: "pending_studies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estudios pendientes" />
    ),
    cell: ({ row }) => {
      const studies = row.getValue("studies") as Study[];
      const pendingStudies = studies.filter(
        (study) => study.status === null || study.status === 400,
      );
      return (
        <Badge variant="outline">
          <CircleHelp className="mr-2 h-4 w-4" />
          {pendingStudies.length}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
