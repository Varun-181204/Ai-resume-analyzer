import { Link } from "react-router-dom";
import {
  FileText,
  FileSearch,
  Briefcase,
  Wand2,
  PenLine,
  Mic,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Resume } from "@/types";
import { cn } from "@/utils/cn";

interface CareerWorkflowBarProps {
  activeResume?: Resume | null;
  currentStage?: number;
  resumeId?: string;
}

export function CareerWorkflowBar({
  activeResume,
  currentStage,
  resumeId,
}: CareerWorkflowBarProps) {
  const hasResume = !!activeResume || !!resumeId;
  const rawScore = activeResume?.atsScore ?? 0;
  const hasAnalysis = hasResume && (rawScore > 0 || (currentStage != null && currentStage >= 2));
  const score = Math.round(Number(rawScore));
  const effectiveId = activeResume?.id || resumeId;

  const steps = [
    {
      num: "01",
      title: "Upload",
      subtitle: activeResume?.fileName || (hasResume ? "Active Resume" : "Add Resume"),
      icon: FileText,
      to: "/upload",
      isComplete: hasResume,
      badgeText: hasResume ? "Uploaded" : "Step 1",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      num: "02",
      title: "ATS Audit",
      subtitle: hasAnalysis && score > 0 ? `${score}% Readiness` : "Score & Insights",
      icon: FileSearch,
      to: effectiveId ? `/analysis?id=${effectiveId}` : "/analysis",
      isComplete: hasAnalysis,
      badgeText: hasAnalysis && score > 0 ? `${score}% ATS` : "Step 2",
      accent: "from-indigo-500 to-cyan-500",
    },
    {
      num: "03",
      title: "Match Job",
      subtitle: "Detect Skill Gaps",
      icon: Briefcase,
      to: effectiveId ? `/job-match?resumeId=${effectiveId}` : "/job-match",
      isComplete: (currentStage ?? 0) >= 3,
      badgeText: "Step 3",
      accent: "from-teal-500 to-emerald-500",
    },
    {
      num: "04",
      title: "Rewrite Bullets",
      subtitle: "Quantify Impact",
      icon: Wand2,
      to: effectiveId ? `/analysis?id=${effectiveId}` : "/analysis",
      isComplete: (currentStage ?? 0) >= 4,
      badgeText: "AI Polish",
      accent: "from-amber-500 to-orange-500",
    },
    {
      num: "05",
      title: "Cover Letter",
      subtitle: "Tailored Content",
      icon: PenLine,
      to: "/content-generator",
      isComplete: (currentStage ?? 0) >= 5,
      badgeText: "Generate",
      accent: "from-purple-500 to-indigo-500",
    },
    {
      num: "06",
      title: "Interview Prep",
      subtitle: "Role-Specific Q&A",
      icon: Mic,
      to: "/interview-prep",
      isComplete: (currentStage ?? 0) >= 6,
      badgeText: "Practice",
      accent: "from-pink-500 to-rose-500",
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;

  return (
    <div className="saas-card relative overflow-hidden p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Career Workflow Pipeline
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Stage {completedCount} of 6 Complete
          </span>
        </div>
        <Link
          to={effectiveId ? `/analysis?id=${effectiveId}` : "/upload"}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span>{hasResume ? "Continue Active Evaluation" : "Start Resume Audit"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Horizontal step flow */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.num}
              to={step.to}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border p-3 transition-all duration-200",
                step.isComplete
                  ? "border-emerald-500/30 bg-emerald-500/[0.05] hover:border-emerald-500/50 hover:shadow-[0_4px_16px_rgba(16,185,129,0.1)] dark:border-emerald-500/20 dark:bg-emerald-950/20"
                  : "border-slate-200/80 bg-slate-50/50 hover:border-indigo-400/50 hover:bg-white hover:shadow-[0_4px_16px_rgba(99,102,241,0.08)] dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-indigo-500/40 dark:hover:bg-slate-900"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:text-slate-500">
                  {step.num}
                </span>
                {step.isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="rounded-md border border-slate-200/80 bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                    {step.badgeText}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md text-white shadow-2xs transition-transform group-hover:scale-110",
                      step.isComplete
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {step.title}
                  </p>
                </div>
                <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {step.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
