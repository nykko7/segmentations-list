import { LoginButton } from "@/components/auth/login-button";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import { LogIn } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";
import { NavbarRoutes } from "./NavbarRoutes";

export const Navbar = async () => {
  const { user } = await validateRequest();

  return (
    <nav className="flex h-full items-center border-b bg-background p-4 shadow-sm">
      <MobileSidebar />
      <NavbarRoutes />
      <div className="ml-auto flex items-center gap-x-2">
        {/* <UserAvatar /> */}
        {user ? (
          <UserAvatar
            user={user}
            // avatar={user.avatar}
            className="ml-auto"
          />
        ) : (
          <LoginButton asChild mode="modal">
            <Button type="button">
              <span className="hidden sm:flex">Iniciar sesión </span>
              <LogIn className="h-6 w-6 sm:ml-2 sm:h-6 sm:w-6" />
            </Button>
          </LoginButton>
        )}
      </div>
    </nav>
  );
};
