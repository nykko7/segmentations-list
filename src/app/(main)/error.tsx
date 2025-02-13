"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions/logout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  const currentPath = usePathname();

  const relogin = async () => {
    // Redirect to login page
    await logout({ redirectTo: `/auth/login?callbackUrl=${currentPath}` });
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2 text-center">
        {/* {error.message} */}
        <h1 className="text-4xl font-bold">
          {error.message === "UNAUTHORIZED"
            ? "Acceso denegado"
            : error.message === "FORBIDDEN"
              ? "¡Sesión expirada!"
              : "¡Algo salio mal!"}
        </h1>
        <p className="text-gray-500">
          {error.message === "UNAUTHORIZED"
            ? "No tienes permisos para acceder a esta página."
            : error.message === "FORBIDDEN"
              ? "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
              : "Parece que algo salió mal. Por favor, inténtalo de nuevo."}
        </p>
      </div>
      <div className="space-x-4">
        <Button onClick={() => reset()} variant={"ghost"}>
          Reintentar
        </Button>
        {error.message === "FORBIDDEN" ? (
          <Button onClick={relogin}>Volver a iniciar sesión</Button>
        ) : (
          <Button>
            <Link href="/">Volver al inicio</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
