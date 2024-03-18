"use client";

import { APP_TITLE } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

type LogoProps = React.HTMLAttributes<HTMLAnchorElement>;

const Logo = ({ className }: LogoProps) => {
  const href = "/";

  return (
    <Link className={cn("flex items-center gap-1", className)} href={href}>
      <h2 className={cn("text-xl font-bold md:text-2xl")}>{APP_TITLE}</h2>
    </Link>
  );
};

export default Logo;
