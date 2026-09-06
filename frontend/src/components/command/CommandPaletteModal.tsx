import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Upload,
  FileSearch,
  Briefcase,
  MessageSquareQuote,
  PenLine,
  GitCompareArrows,
  Bot,
  Eye,
  Rocket,
  Mic,
  User,
  History,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import type { Resume } from "@/types";
import { cn } from "@/utils/cn";

interface CommandItem {
  id: string;
  label: string;
  category: "Navigation" | "Actions" | "Resumes";
  icon: typeof LayoutDashboard;
  to?: string;
  action?: () => void;
  badge?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumes?: Resume[];
  onSelectResume?: (id: string) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  resumes = [],
  onSelectResume,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allItems: CommandItem[] = useMemo(() => {
    const navItems: CommandItem[] = [
      { id: "cmd-dash", label: "Command Center (Dashboard)", category: "Navigation", icon: LayoutDashboard, to: "/dashboard" },
      { id: "cmd-upload", label: "Resume Studio & Upload", category: "Navigation", icon: Upload, to: "/upload" },
      { id: "cmd-analysis", label: "Resume Intelligence & ATS Analysis", category: "Navigation", icon: FileSearch, to: "/analysis" },
      { id: "cmd-jobmatch", label: "Job Match & Skill Gap Workspace", category: "Navigation", icon: Briefcase, to: "/job-match" },
      { id: "cmd-content", label: "AI Cover Letter Generator", category: "Navigation", icon: PenLine, to: "/content-generator" },
      { id: "cmd-prep", label: "Interview Preparation", category: "Navigation", icon: MessageSquareQuote, to: "/interview-prep" },
      { id: "cmd-mock", label: "Mock Interview Simulation", category: "Navigation", icon: Mic, to: "/mock-interview" },
      { id: "cmd-chat", label: "AI Career Copilot Chat", category: "Navigation", icon: Bot, to: "/ai-chat" },
      { id: "cmd-compare", label: "Compare Resumes", category: "Navigation", icon: GitCompareArrows, to: "/compare" },
      { id: "cmd-visualize", label: "Resume Visualizer", category: "Navigation", icon: Eye, to: "/visualize" },
      { id: "cmd-hub", label: "Career Hub", category: "Navigation", icon: Rocket, to: "/career-hub" },
      { id: "cmd-history", label: "Resume History", category: "Navigation", icon: History, to: "/history" },
      { id: "cmd-profile", label: "Account Profile & Settings", category: "Navigation", icon: User, to: "/profile" },
    ];

    const actionItems: CommandItem[] = [
      {
        id: "act-new-scan",
        label: "Upload & Scan New Resume",
        category: "Actions",
        icon: Sparkles,
        to: "/upload",
        badge: "Quick Action",
      },
      {
        id: "act-match",
        label: "Compare Resume to Job Description",
        category: "Actions",
        icon: Briefcase,
        to: "/job-match",
        badge: "Quick Action",
      },
    ];

    const resumeItems: CommandItem[] = resumes.slice(0, 5).map((r) => ({
      id: `res-${r.id}`,
      label: `${r.fileName} (${r.atsScore ?? 0}% ATS)`,
      category: "Resumes",
      icon: FileText,
      action: () => {
        if (onSelectResume) onSelectResume(r.id);
        navigate(`/analysis?id=${r.id}`);
      },
      badge: `${r.atsScore ?? 0}%`,
    }));

    return [...actionItems, ...resumeItems, ...navItems];
  }, [resumes, onSelectResume, navigate]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Handle keyboard navigation inside command palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const current = filteredItems[selectedIndex];
        if (current) {
          if (current.action) {
            current.action();
          } else if (current.to) {
            navigate(current.to);
          }
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Header Search Box */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search tools, commands, resumes... (e.g. ATS, Job Match)"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No commands or tools match "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else if (item.to) {
                            navigate(item.to);
                          }
                          onClose();
                        }}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all",
                          isSelected
                            ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer keyboard hints */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>↑↓ Navigate</span>
                <span>•</span>
                <span>↵ Open</span>
                <span>•</span>
                <span>Esc Close</span>
              </div>
              <span className="font-mono text-[10px] text-indigo-500">AI Command Center</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
