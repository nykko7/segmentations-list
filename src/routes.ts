import { type UserRoles } from "@/server/db/schema";
import { BarChart, List, type LucideIcon } from "lucide-react";

type routesPerRole = Record<
  UserRoles,
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
    title: "Administrador",
    routes: [
      // {
      //   icon: Layout,
      //   label: "Dashboard",
      //   href: "/",
      // },
      {
        icon: List,
        label: "Lista de usuarios",
        href: "/admin/users",
      },
    ],
    order: 1,
  },
  RADIOLOGIST: {
    title: "Radiólogo",
    routes: [
      {
        icon: List,
        label: "Lista de exámenes",
        href: "/",
      },
    ],
    order: 0,
  },
  ML_ENGINEER: {
    title: "Ingeniero de ML",
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
