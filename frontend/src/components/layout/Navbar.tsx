import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  Search,
  ChevronDown,
  FileText,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resumeApi } from "@/api/resume";
import type { Resume } from "@/types";
import { CommandPaletteModal } from "@/components/command/CommandPaletteModal";
import { cn } from "@/utils/cn";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isResumeDropdownOpen, setIsResumeDropdownOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

  // Load user resumes for top bar selector
  useEffect(() => {
    resumeApi
      .getHistory()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        if (list.length > 0) {
          // If URL has an ID, match it, otherwise use latest
          const searchParams = new URLSearchParams(location.search);
          const currentId = searchParams.get("id") || searchParams.get("resumeId");
          const found = list.find((r) => r.id === currentId) || list[0];
          setSelectedResume(found);
        }
      })
      .catch(() => {});
  }, [location.search]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSelectResume = (r: Resume) => {
    setSelectedResume(r);
    setIsResumeDropdownOpen(false);
    navigate(`/analysis?id=${r.id}`);
  };

  return (
    <>
      {/* ⌘K Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        resumes={resumes}
        onSelectResume={(id) => {
          const found = resumes.find((r) => r.id === id);
          if (found) setSelectedResume(found);
        }}
      />

      <header className="command-bar sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-2 px-3 sm:px-6">
        {/* Left: Mobile hamburger + Active Resume Workspace Selector */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Toggle navigation drawer"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Active Resume Dropdown Selector */}
          <div className="relative">
            {resumes.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsResumeDropdownOpen(!isResumeDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <FileText className="h-3 w-3" />
                </div>
                <div className="flex max-w-[140px] items-center gap-1.5 sm:max-w-[220px]">
                  <span className="truncate font-semibold">
                    {selectedResume?.fileName || "Select Resume"}
                  </span>
                  {selectedResume?.atsScore != null && (
                    <span className="tech-badge">
                      {Math.round(selectedResume.atsScore)}%
                    </span>
                  )}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="status-pulse">
                  <span className="status-pulse-ping" />
                  <span className="status-pulse-dot" />
                </span>
                <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  AI Career Command Center
                </span>
              </div>
            )}

            {/* Resume Selection Flyout */}
            {isResumeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsResumeDropdownOpen(false)}
                />
                <div className="absolute left-0 top-11 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Resume Context
                    </span>
                    <button
                      onClick={() => {
                        setIsResumeDropdownOpen(false);
                        navigate("/upload");
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      + New
                    </button>
                  </div>
                  <div className="max-h-60 space-y-1 overflow-y-auto scrollbar-thin">
                    {resumes.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectResume(r)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all",
                          selectedResume?.id === r.id
                            ? "bg-indigo-50 font-semibold text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <span className="truncate pr-2">{r.fileName}</span>
                        <span className="tech-badge shrink-0">{r.atsScore ?? 0}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Global ⌘K Quick Command Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm justify-center">
          <button
            type="button"
            onClick={() => setIsCommandModalOpen(true)}
            className="group flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-1.5 text-xs text-slate-400 transition-all duration-200 hover:border-indigo-400/60 hover:bg-white hover:shadow-[0_0_16px_rgba(99,102,241,0.12)] dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-indigo-500/50 dark:hover:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-indigo-500" />
              <span className="text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                Quick action or search...
              </span>
            </div>
            <kbd className="tech-badge font-mono border-slate-200/80 bg-white shadow-2xs group-hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800 dark:group-hover:border-indigo-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: AI Engine Status + Theme + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setIsCommandModalOpen(true)}
            aria-label="Open search command palette"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* AI Engine Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.12)] dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="status-pulse">
              <span className="status-pulse-ping bg-emerald-400" />
              <span className="status-pulse-dot bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>
            <span className="font-mono tracking-tight">Gemini 2.5 AI Active</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </Button>

          {/* User Profile Pill */}
          <button
            onClick={() => navigate("/profile")}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 p-1 transition-all hover:border-slate-300 hover:bg-white dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[11px] font-bold text-white shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden pr-1.5 text-xs font-medium text-slate-700 sm:inline dark:text-slate-300">
              {user?.name?.split(" ")[0] || "Account"}
            </span>
          </button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
    </>
  );
}
