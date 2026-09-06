import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { DashboardTopBar } from "./DashboardTopBar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-slate-50 dvh-screen dark:bg-[#090D16]">
      {/* Luminous atmospheric ambient mesh lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[550px] w-[550px] rounded-full bg-indigo-500/[0.07] blur-[120px] dark:bg-indigo-600/[0.12]" />
        <div className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/[0.05] blur-[140px] dark:bg-purple-600/[0.10]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-[120px] dark:bg-emerald-500/[0.06]" />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <DashboardTopBar />
        <main className="dashboard-scroll flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-7 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
