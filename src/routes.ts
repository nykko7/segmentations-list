import { UserRolesLabel, type UserRole } from "@/server/db/schema";
import { BarChart, List, type LucideIcon } from "lucide-react";

type routesPerRole = Record<
  UserRole,
  {
    title: string;
    routes: {
      icon: LucideIcon;
      label: string;
      href: string;
    }[];
    order: number;
  }
>;

export const routesPerRole: routesPerRole = {
  // USER: {
  //   title: "Usuario",
  //   routes: [
  //     {
  //       icon: HomeIcon,
  //       label: "Home",
  //       href: "/",
  //     },
  //   ],
  //   order: 0,
  // },
  ADMIN: {
    title: UserRolesLabel.ADMIN,
    routes: [
      // {
      //   icon: Layout,
      //   label: "Dashboard",
      //   href: "/",
      // },
      {
        icon: List,
        label: "Gestión de usuarios",
        href: "/admin/users",
      },
    ],
    order: 1,
  },
  RADIOLOGIST: {
    title: UserRolesLabel.RADIOLOGIST,
    routes: [
      {
        icon: List,
        label: "Gestión de estudios",
        href: "/studies-list",
      },
      {
        icon: List,
        label: "Gestión de pacientes",
        href: "/patients-list",
      },
      // {
      //   icon: List,
      //   label: "Gestión de series",
      //   href: "/",
      // },
      // {
      //   icon: LucideFileLock,
      //   label: "Gestión privada",
      //   href: "/private-list",
      // },
    ],
    order: 0,
  },
  ML_ENGINEER: {
    title: UserRolesLabel.ML_ENGINEER,
    routes: [
      {
        icon: BarChart,
        label: "Analíticas",
        href: "/ml_engineer/analytics",
      },
    ],
    order: 3,
  },
};
