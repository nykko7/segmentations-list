"use client";

import { type Row } from "@tanstack/react-table";
import { ClipboardPenLine, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { userProfileSchema } from "@/server/db/schema";
import CourseModal from "../CourseModal";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const user = userProfileSchema.parse(row.original);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir opciones</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <CourseModal course={user}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <ClipboardPenLine className="mr-2 h-5 w-5" />
            Editar usuario
          </DropdownMenuItem>
        </CourseModal>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="bg-destructive text-destructive-foreground">
          <Trash2 className="mr-2 h-5 w-5" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
