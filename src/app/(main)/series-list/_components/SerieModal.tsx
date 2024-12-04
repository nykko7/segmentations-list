"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Serie } from "@/server/db/schema";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import SerieForm from "./SerieForm";

type CourseModalProps = {
  serie?: Serie;
  emptyState?: boolean;
  children?: React.ReactNode;
};

export default function SerieModal({
  serie,
  emptyState,
  children,
}: CourseModalProps) {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const editing = !!serie?.series_id;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : emptyState ? (
          <Button>
            <PlusIcon className="mr-2 h-5 w-5" />
            Nueva Serie
          </Button>
        ) : (
          <Button variant={editing ? "ghost" : "outline"}>
            {editing ? "Editar" : "Agregar nuevo"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{editing ? "Editar" : "Crear"} Serie</DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-5">
          <SerieForm closeModal={closeModal} serie={serie} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
