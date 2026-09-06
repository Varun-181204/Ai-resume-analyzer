import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  Briefcase,
  Bot,
  Rocket,
  User,
  History,
  GitCompareArrows,
  Eye,
  MessageSquareQuote,
  PenLine,
  Mic,
  MessageSquareHeart,
  X,
  Brain,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { FeedbackModal } from "@/components/FeedbackModal";

interface NavRailItem {
  to: string;
  label: string;
  subLabel: string;
  icon: typeof LayoutDashboard;
}

const primaryRailItems: NavRailItem[] = [
  { to: "/dashboard", label: "Home", subLabel: "Command Center", icon: LayoutDashboard },
  { to: "/upload", label: "Resume", subLabel: "Studio & Upload", icon: Upload },
  { to: "/analysis", label: "Analyze", subLabel: "ATS Intelligence", icon: FileSearch },
  { to: "/job-match", label: "Jobs", subLabel: "Match & Gaps", icon: Briefcase },
  { to: "/career-hub", label: "Career", subLabel: "Hub & Prep", icon: Rocket },
  { to: "/ai-chat", label: "Copilot", subLabel: "Career Assistant", icon: Bot },
];

const secondaryTools = [
  { to: "/content-generator", label: "Cover Letter Gen", icon: PenLine },
  { to: "/interview-prep", label: "Interview Prep", icon: MessageSquareQuote },
  { to: "/mock-interview", label: "Mock Interview", icon: Mic },
  { to: "/compare", label: "Compare Resumes", icon: GitCompareArrows },
  { to: "/visualize", label: "Resume Visualizer", icon: Eye },
  { to: "/history", label: "Scan History", icon: History },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const location = useLocation();

  const isSecondaryActive = secondaryTools.some((t) => location.pathname.startsWith(t.to));

  return (
    <>
      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DESKTOP: COMPACT NAVIGATION RAIL (76px) */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "command-rail hidden h-full w-[76px] shrink-0 lg:flex",
          "transition-all duration-200"
        )}
      >
        {/* Logo / Brand Icon */}
        <div className="flex h-16 w-full items-center justify-center border-b border-slate-200/80 dark:border-white/[0.06]">
          <NavLink
            to="/dashboard"
            aria-label="AI Career Command Center Home"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-transform duration-200 hover:scale-105"
          >
            <Brain className="h-5 w-5" />
            <span className="sr-only">AI Career Command Center</span>
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              AI Command Center
            </span>
          </NavLink>
        </div>

        {/* Primary Navigation Icons */}
        <nav className="flex flex-1 flex-col items-center gap-2 py-4" aria-label="Main Navigation">
          {primaryRailItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <div key={item.to} className="group relative">
                <NavLink
                  to={item.to}
                  className={cn(
                    "relative flex h-14 w-14 flex-col items-center justify-center rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-b from-indigo-500/20 to-purple-500/10 text-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/40 dark:from-indigo-500/25 dark:to-purple-500/15 dark:text-indigo-300 dark:ring-indigo-400/50"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-150 group-hover:scale-110",
                      isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                    )}
                  />
                  <span className="mt-1 text-[10px] font-semibold tracking-tight leading-none">
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.div
                      layoutId="active-rail-indicator"
                      className="absolute -left-1.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                    />
                  )}
                </NavLink>

                {/* Desktop Hover Tooltip */}
                <div className="pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-left opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.subLabel}</p>
                </div>
              </div>
            );
          })}

          {/* Quick Tools Drawer Trigger */}
          <div className="group relative mt-1">
            <button
              type="button"
              onClick={() => setToolsDrawerOpen(!toolsDrawerOpen)}
              className={cn(
                "relative flex h-12 w-14 flex-col items-center justify-center rounded-xl transition-all duration-200",
                isSecondaryActive || toolsDrawerOpen
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-800"
                  : "text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900/60 dark:hover:text-slate-300"
              )}
            >
              <History className="h-4 w-4" />
              <span className="mt-1 text-[9px] font-medium tracking-tight">Tools</span>
            </button>

            {/* Desktop Hover Tooltip */}
            <div className="pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">More Career Tools</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Cover letter, compare, mock prep</p>
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-2 border-t border-slate-200/80 py-4 dark:border-slate-800/80">
          {/* Feedback */}
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            aria-label="Send user feedback"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          >
            <MessageSquareHeart className="h-4 w-4 transition-transform group-hover:scale-110 text-indigo-500/80" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              Send Feedback
            </span>
          </button>

          {/* Profile */}
          <NavLink
            to="/profile"
            aria-label="Account Settings & Profile"
            className={({ isActive }) =>
              cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/30"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
              )
            }
          >
            <User className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              Account & Profile
            </span>
          </NavLink>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* DESKTOP TOOLS FLYOUT MENU (When clicked from 'Tools' on rail) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {toolsDrawerOpen && (
          <>
            <div
              className="fixed inset-0 z-30 hidden lg:block"
              onClick={() => setToolsDrawerOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed left-[84px] top-20 z-40 hidden w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:block"
            >
              <div className="mb-2 flex items-center justify-between px-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Career Acceleration Tools
                </span>
                <button
                  onClick={() => setToolsDrawerOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-0.5">
                {secondaryTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isActive = location.pathname.startsWith(tool.to);
                  return (
                    <NavLink
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setToolsDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                        isActive
                          ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                      )}
                    >
                      <ToolIcon className="h-4 w-4 text-slate-400" />
                      <span>{tool.label}</span>
                      <ChevronRight className="ml-auto h-3 w-3 text-slate-300" />
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MOBILE: SLIDE-OVER DRAWER */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col transition-transform duration-300 ease-in-out lg:hidden",
          "border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Command Center
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Workflow
            </p>
            <div className="space-y-1">
              {primaryRailItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                      isActive
                        ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4 text-indigo-500" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[10px] text-slate-400">{item.subLabel}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Acceleration Tools
            </p>
            <div className="space-y-1">
              {secondaryTools.map((tool) => {
                const ToolIcon = tool.icon;
                const isActive = location.pathname.startsWith(tool.to);
                return (
                  <NavLink
                    key={tool.to}
                    to={tool.to}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                      isActive
                        ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                    )}
                  >
                    <ToolIcon className="h-4 w-4 text-slate-400" />
                    <span>{tool.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setFeedbackOpen(true);
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <MessageSquareHeart className="h-4 w-4 text-indigo-500" />
            <span>Send Feedback</span>
          </button>
        </div>
      </aside>
    </>
  );
}
