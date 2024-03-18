"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

interface SocialProps {
  disabled?: boolean;
}

export const Social = ({ disabled }: SocialProps) => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = async (provider: "google" | "github" | "keycloak") => {
    // await signIn(provider, {
    //   callbackUrl: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
    // });
  };

  return (
    <div className="flex w-full items-center gap-x-2">
      {/* <Button
        size="lg"
        className="w-full gap-2 whitespace-normal"
        variant={"outline"}
        onClick={() => onClick("google")}
        disabled={disabled}
      >
        <span>Iniciar sesión con Google</span>
      </Button> */}
      <Button
        size="lg"
        className="w-full gap-2 whitespace-normal"
        variant={"outline"}
        onClick={() => onClick("google")}
        disabled={disabled}
      >
        <span>Iniciar sesión con Keycloak</span>
      </Button>
      {/* <Button
        size="lg"
        className="w-full"
        variant={"outline"}
        onClick={() => onClick("github")}
      >
        <FaGithub />
      </Button> */}
    </div>
  );
};
