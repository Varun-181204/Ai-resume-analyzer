import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Target, PenLine, Mic } from "lucide-react";
import { cn } from "@/utils/cn";

const steps = [
  { to: "/analysis", icon: BarChart3, label: "Resume Score" },
  { to: "/job-match", icon: Target, label: "Job Match" },
  { to: "/content-generator", icon: PenLine, label: "Cover Letter" },
  { to: "/interview-prep", icon: Mic, label: "Interview Prep" },
];

export function DashboardTopBar() {
  const { pathname } = useLocation();
  // Only show on tool pages (not dashboard home, upload, profile, etc.)
  const isToolPage = steps.some((s) => pathname.startsWith(s.to));
  if (!isToolPage) return null;

  return (
    <div className="min-w-0 border-b border-slate-200/80 bg-slate-50/70 px-3 py-1.5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 lg:inline-block">
          Workflow
        </span>
        <nav className="flex min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto scrollbar-thin sm:justify-center sm:gap-2">
          {steps.map((step, i) => {
            const isActive = pathname.startsWith(step.to);
            return (
              <NavLink
                key={step.to}
                to={step.to}
                className={cn(
                  "group flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  isActive
                    ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-indigo-300 dark:ring-slate-700/80"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-indigo-600 text-white dark:bg-indigo-500"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  )}
                >
                  {i + 1}
                </span>
                <step.icon
                  className={cn(
                    "h-3.5 w-3.5",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className="truncate">{step.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
