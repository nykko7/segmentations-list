"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserSquare } from "lucide-react";
import { useState } from "react";
import { ProfileForm } from "./forms/profile-form";

type ProfileModalProps = {
  children?: React.ReactNode;
};

export default function ProfileModal({ children }: ProfileModalProps) {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="flex items-center">
            <UserSquare className="mr-2 h-8 w-8" />
            <span className="text-2xl">Actualiza tu Perfil</span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-5">
          <ProfileForm closeModal={closeModal} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
