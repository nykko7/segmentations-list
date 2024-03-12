"use client";

import { type Row } from "@tanstack/react-table";
import { ClipboardPenLine, Copy, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SerieSchema } from "@/server/db/schema";
import { toast } from "sonner";
import SerieModal from "../SerieModal";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const serie = SerieSchema.parse(row.original);

  const serieInfo = `
    Patient Code: ${serie.patient_code}
    Study ID: ${serie.study_id}
    Study UUID: ${serie.study_uuid}
    Serie ID: ${serie.serie_id}
    Serie UUID: ${serie.serie_uuid}
    Serie Name: ${serie.serie_name}
    Serie Status: ${serie.serie_status}
  `;

  const handleCopySerieInfo = async () => {
    await navigator.clipboard.writeText(serieInfo);
    toast.success("Información de la serie copiada al portapapeles");
  };

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
        <SerieModal serie={serie}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <ClipboardPenLine className="mr-2 h-5 w-5" />
            Editar serie
          </DropdownMenuItem>
        </SerieModal>

        <DropdownMenuItem onClick={handleCopySerieInfo}>
          <Copy className="mr-2 h-5 w-5" />
          Copiar información de la serie
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem className="bg-destructive text-destructive-foreground">
          <Trash2 className="mr-2 h-5 w-5" />
          Eliminar
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
