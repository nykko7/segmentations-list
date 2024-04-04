"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type updateUserSchema } from "@/server/db/schema";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { RegisterUserForm } from "./RegisterUserForm";
import { UpdateUserProfileForm } from "./UpdateUserProfileForm";

type UserModalProps = {
  user?: updateUserSchema;
  emptyState?: boolean;
  children?: React.ReactNode;
};

export default function SerieModal({
  user,
  emptyState,
  children,
}: UserModalProps) {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const editing = !!user?.id;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : emptyState ? (
          <Button>
            <PlusIcon className="mr-2 h-5 w-5" />
            Nuevo usuario
          </Button>
        ) : (
          <Button variant={editing ? "ghost" : "outline"}>
            {editing ? "Editar" : "Registrar usuario"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{editing ? "Editar" : "Registrar"} Usuario</DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-5">
          {editing ? (
            <UpdateUserProfileForm closeModal={closeModal} user={user} />
          ) : (
            <RegisterUserForm closeModal={closeModal} />
          )}
          {/* <UserForm closeModal={closeModal} user={user} /> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
