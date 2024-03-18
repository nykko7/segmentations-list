import Logo from "@/components/brand/logo";
import { SidebarRoutes } from "./SidebarRoutes";

export const Sidebar = () => {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
      <div className="flex h-[80px] items-center justify-center">
        <Logo />
      </div>
      <div className="space-y-4 py-4">
        <SidebarRoutes />
        <div className="px-3 py-2"></div>
      </div>
    </div>
  );
};
