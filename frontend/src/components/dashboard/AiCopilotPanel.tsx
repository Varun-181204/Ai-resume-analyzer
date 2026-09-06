import { Link } from "react-router-dom";
import {
  Bot,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wand2,
} from "lucide-react";
import type { Resume, Analysis } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface AiCopilotPanelProps {
  resume?: Resume | null;
  analysis?: Analysis | null;
}

export function AiCopilotPanel({ resume, analysis }: AiCopilotPanelProps) {
  const atsScore = Math.round(Number(resume?.atsScore ?? 0));
  const hasAnalysis = !!analysis;

  // Real-data derived priority actions
  const actions = [];

  if (hasAnalysis) {
    if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
      actions.push({
        priority: "Priority 1",
        title: `Bridge ${analysis.missingKeywords.length} Missing Keywords`,
        desc: `Add verified skills like "${analysis.missingKeywords.slice(0, 2).join(", ")}" to pass ATS keyword filters.`,
        actionLabel: "Review Keywords",
        to: `/analysis?id=${resume?.id}`,
        icon: AlertTriangle,
        color: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/20",
      });
    }

    if (analysis.experienceScore < 70) {
      actions.push({
        priority: "Priority 2",
        title: "Strengthen Experience Bullet Points",
        desc: "Experience scored below 70%. Transform passive duty statements into quantified impact metrics.",
        actionLabel: "Rewrite with AI",
        to: `/analysis?id=${resume?.id}`,
        icon: Wand2,
        color: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200/80 bg-purple-50/40 dark:border-purple-900/30 dark:bg-purple-950/20",
      });
    } else if (analysis.projectsScore < 70) {
      actions.push({
        priority: "Priority 2",
        title: "Elevate Projects Section",
        desc: "Add technical stacks, live GitHub links, and specific architectural achievements.",
        actionLabel: "Optimize Projects",
        to: `/analysis?id=${resume?.id}`,
        icon: Sparkles,
        color: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/30 dark:bg-indigo-950/20",
      });
    }

    actions.push({
      priority: actions.length === 0 ? "Priority 1" : actions.length === 1 ? "Priority 2" : "Priority 3",
      title: "Evaluate Real Job Description Match",
      desc: "Paste a target job posting to compute precise skill coverage and tailor this resume.",
      actionLabel: "Match Job",
      to: "/job-match",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20",
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/60 dark:backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Career Copilot
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personalized intelligence based on your active resume data
            </p>
          </div>
        </div>

        <Link
          to="/ai-chat"
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span>Open Chat</span>
        </Link>
      </div>

      {/* Main Copilot Briefing */}
      {hasAnalysis ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 p-3.5 dark:border-indigo-950/60 dark:from-indigo-950/30 dark:to-purple-950/30">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {atsScore >= 80
                ? "🌟 Executive Readiness Assessment:"
                : atsScore >= 60
                ? "💡 Improvement Opportunity Detected:"
                : "⚠️ Critical Action Required:"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {atsScore >= 80
                ? `Your resume for "${resume?.fileName}" is performing strongly at ${atsScore}% ATS compatibility. Proceed to tailored cover letter generation and interview preparation.`
                : analysis.experienceScore < analysis.skillsScore
                ? `Your technical skills scored ${analysis.skillsScore}%, but work experience scored ${analysis.experienceScore}%. Adding measurable numbers (e.g. % increase, team size, scale) will substantially raise ATS ranking.`
                : `Your resume scored ${atsScore}%. Addressing missing keywords and polishing section clarity will unlock higher match rates across job boards.`}
            </p>
          </div>

          {/* Sequential Action Queue */}
          <div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Your Next Best Actions
            </p>
            <div className="space-y-2">
              {actions.slice(0, 3).map((action, i) => {
                const Icon = action.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between",
                      action.border
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", action.color)} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {action.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {action.title}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                          {action.desc}
                        </p>
                      </div>
                    </div>

                    <Link to={action.to} className="self-end sm:self-center">
                      <Button size="sm" variant="outline" className="h-7 gap-1 px-2.5 text-xs font-semibold">
                        <span>{action.actionLabel}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Sparkles className="mb-2 h-8 w-8 text-indigo-400" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            No active resume analysis yet
          </p>
          <p className="mt-1 max-w-sm text-[11px] text-slate-500 dark:text-slate-400">
            Upload your resume or run an ATS scan to unlock line-by-line copilot suggestions and priority actions.
          </p>
          <Link to="/upload" className="mt-3">
            <Button size="sm" className="gap-1.5 shadow-sm">
              Upload Resume
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
