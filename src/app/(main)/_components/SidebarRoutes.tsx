"use client";

import { useCurrentRoles } from "@/hooks/user/use-current-roles";
import { routesPerRole } from "@/routes";
import SidebarItem from "./SidebarItem";

export const SidebarRoutes = () => {
  const roles = useCurrentRoles();

  // const roles = session?.user?.roles ?? [];

  // const roles: Array<UserRoles> = [
  //   "ADMIN",
  //   "RADIOLOGIST",
  //   // "USER",
  //   "ML_ENGINEER",
  // ];

  // Admin roles:
  // const roles = [{ name: "ADMIN" }, { name: "TEACHER" }, { name: "STUDENT" }];
  // // Teacher roles:
  // const roles = [{ name: "TEACHER" }, { name: "STUDENT" }];
  // // Student roles:
  // const roles = [{ name: "STUDENT" }];

  const userRoutes = roles
    .map((role) => routesPerRole[role])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex w-full flex-col">
      {userRoutes.map((route) => (
        <div className="px-3 py-2" key={route.title}>
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {route.title}
          </h2>

          <div className="space-y-1">
            {route.routes.map((route) => (
              <SidebarItem
                key={route.href}
                icon={route.icon}
                label={route.label}
                href={route.href}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
