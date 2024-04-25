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

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteUser } from "@/lib/auth/actions/delete-user";
import { type userIdSchema, userProfileSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useRouter } from "next/navigation";
import { type z } from "zod";
import UserModal from "../UserModal";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  asDropdown?: boolean;
}

export function DataTableRowActions<TData>({
  row,
  asDropdown = false,
}: DataTableRowActionsProps<TData>) {
  const user = userProfileSchema.parse(row.original);

  const utils = api.useUtils();
  const router = useRouter();

  // const { mutate: deleteCourse } = api.user.deleteUser.useMutation({
  //   onSuccess: async () => {
  //     await utils.user.getAll.invalidate();
  //     router.refresh();
  //   },
  // });
  const onDelete = async ({ id: userId }: z.infer<typeof userIdSchema>) => {
    await deleteUser({ id: userId });
    await utils.user.getAll.invalidate();
    router.refresh();
  };

  return asDropdown ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir opciones</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <UserModal user={user}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <ClipboardPenLine className="mr-2 h-5 w-5" />
            Editar usuario
          </DropdownMenuItem>
        </UserModal>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ConfirmDialog onConfirm={() => onDelete({ id: user.id })} asChild>
            <div className="flex">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar
            </div>
          </ConfirmDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UserModal user={user}>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="h-8 w-8 rounded-lg "
              >
                <ClipboardPenLine className="h-4 w-4" />
              </Button>
            </UserModal>
          </TooltipTrigger>
          <TooltipContent>Editar Usuario</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ConfirmDialog onConfirm={() => onDelete({ id: user.id })} asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="h-8 w-8 rounded-lg "
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </TooltipTrigger>
          <TooltipContent>Eliminar Usuario</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
