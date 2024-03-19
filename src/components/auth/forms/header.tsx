import { APP_TITLE } from "@/constants";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <h1 className={cn("text-3xl font-semibold ", font.className)}>
        <Link href="/">🔐 {APP_TITLE}</Link>
      </h1>
      <p>{label}</p>
    </div>
  );
};
