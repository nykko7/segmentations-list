"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";
import { Social } from "./social";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  showSocial?: boolean;
  isPending?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial = false,
  isPending = false,
}: CardWrapperProps) => {
  return (
    <Card className="w-[calc(100vw-40px)] shadow-md sm:w-[400px]">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social disabled={isPending} />
        </CardFooter>
      )}

      <CardFooter>
        {backButtonLabel && backButtonHref && (
          <BackButton label={backButtonLabel} href={backButtonHref} />
        )}
      </CardFooter>
    </Card>
  );
};
