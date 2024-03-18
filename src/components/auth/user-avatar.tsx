"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions/logout";
import { type User } from "lucia";
import { LogOut, UserSquare } from "lucide-react";
import ProfileModal from "./profile-modal";

export const UserAvatar = ({
  user,
  className,
}: {
  user: User;
  className?: string;
}) => {
  const handleSignOut = async () => {
    await logout({});
  };

  const userName = user.name;
  const userLastName = user.lastName;

  const fullName = `${userName} ${userLastName}`;

  const nameInitials =
    `${userName?.split(" ")[0]?.charAt(0)}${userLastName?.split(" ")[0]?.charAt(0)}`.toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={className}>
        {/* eslint @next/next/no-img-element:off */}
        {/* <img
          // src={avatar ?? "https://source.boringavatars.com/marble/60/" + email}
          src={"https://github.com/shadcn.png"}
          alt="Avatar"
          className="block h-8 w-8 rounded-full leading-none"
          width={64}
          height={64}
        ></img> */}
        {/* <Button
          variant={"ghost"}
          // className="rounded-full"
          // size={type === "simple" ? "icon" : "default"}
          className={cn(
            // type === "simple"
            //   ? "rounded-full"
            "flex items-center gap-2 rounded-l-full rounded-r-full pl-0 ",
          )}
        > */}
        <Avatar className="border-2 border-primary">
          <AvatarFallback className="hover:bg-primary">
            {nameInitials}
          </AvatarFallback>
        </Avatar>
        {/* <span className="text-sm font-semibold">{user?.email}</span> */}
        {/* </Button> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="flex flex-col items-start">
          <span className="text-sm font-semibold">{fullName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/dashboard/billing">Billing</Link>
          </DropdownMenuItem> */}
          <ProfileModal>
            <DropdownMenuItem
              className="flex cursor-pointer items-center"
              onSelect={(e) => e.preventDefault()}
            >
              <UserSquare className="mr-2 h-5 w-5" />
              Perfil
              {/* <Link href="/auth/profile">Perfil</Link> */}
            </DropdownMenuItem>
          </ProfileModal>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex cursor-pointer items-center hover:bg-destructive">
          <ConfirmDialog
            onConfirm={handleSignOut}
            title="¿Estás seguro que deseas cerrar sesión?"
            description="Serás redirigido a la página de inicio"
          >
            <div className="flex cursor-pointer items-center">
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar sesión
            </div>
          </ConfirmDialog>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
