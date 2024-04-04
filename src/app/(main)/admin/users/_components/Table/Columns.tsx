"use client";

import { Badge } from "@/components/ui/badge";
import { UserRolesLabel, type User } from "@/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "./DataTableRowAction";

export const columns: ColumnDef<User>[] = [
  // {
  //   header: "ID",
  //   accessorKey: "id",
  // },
  {
    header: "Nombre",
    accessorKey: "name",
  },
  {
    header: "Apellido",
    accessorKey: "lastName",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "roles",
    header: "Roles",
    accessorKey: "roles",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* first admin, then ml_engineer, then radiologist */}

          {user.roles.map((role) => (
            <Badge key={role} variant={"outline"}>
              {UserRolesLabel[role]}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <DataTableRowActions row={row} asDropdown />
        </div>
      );
    },
  },
];
