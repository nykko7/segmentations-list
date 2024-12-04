// import { auth } from "@/server/auth";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import { Navbar } from "./_components/Navbar";
import { Sidebar } from "./_components/Sidebar";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/auth/login");
  }
  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full lg:pl-60">
        <Navbar />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-60 flex-col lg:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-[80px] lg:pl-60">
        <div className="mx-auto max-w-screen-xl px-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
