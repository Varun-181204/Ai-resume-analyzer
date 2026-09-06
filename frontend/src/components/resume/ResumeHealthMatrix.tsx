import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Briefcase,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type { Analysis } from "@/types";
import { cn } from "@/utils/cn";

interface ResumeHealthMatrixProps {
  analysis?: Analysis | null;
  atsScore?: number;
  className?: string;
}

export function ResumeHealthMatrix({ analysis, atsScore, className }: ResumeHealthMatrixProps) {
  if (!analysis) return null;

  // Derive status strictly from real existing scores
  const getStatus = (score: number) => {
    if (score >= 70) return { label: "Healthy", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/[0.06] dark:bg-emerald-950/30", border: "border-emerald-500/25 dark:border-emerald-900/40", icon: CheckCircle2 };
    if (score >= 50) return { label: "Attention", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/[0.06] dark:bg-amber-950/30", border: "border-amber-500/25 dark:border-amber-900/40", icon: AlertTriangle };
    return { label: "Critical", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/[0.06] dark:bg-rose-950/30", border: "border-rose-500/25 dark:border-rose-900/40", icon: XCircle };
  };

  const keywordScore = Math.min(100, Math.round((analysis.keywords.length / Math.max(1, analysis.keywords.length + analysis.missingKeywords.length)) * 100));
  const readabilityScore = analysis.metrics?.brevityScore ?? analysis.educationScore ?? 65;
  const structureScore = analysis.metrics?.structureScore ?? analysis.projectsScore ?? 65;

  const healthItems = [
    {
      name: "Content & Depth",
      score: analysis.skillsScore,
      icon: FileCheck,
      details: `${analysis.skillsScore}% core section score`,
      status: getStatus(analysis.skillsScore),
    },
    {
      name: "Keywords & ATS Match",
      score: keywordScore,
      icon: Sparkles,
      details: `${analysis.keywords.length} found, ${analysis.missingKeywords.length} missing`,
      status: getStatus(keywordScore),
    },
    {
      name: "Experience & Impact",
      score: analysis.experienceScore,
      icon: Briefcase,
      details: `${analysis.experienceScore}% impact evaluation`,
      status: getStatus(analysis.experienceScore),
    },
    {
      name: "Structure & Layout",
      score: structureScore,
      icon: Layers,
      details: `${structureScore}% standard ATS formatting`,
      status: getStatus(structureScore),
    },
    {
      name: "Skills Breadth",
      score: analysis.skillsScore,
      icon: Sparkles,
      details: `${analysis.keywords.length} competencies cataloged`,
      status: getStatus(analysis.skillsScore),
    },
    {
      name: "Readability & Brevity",
      score: readabilityScore,
      icon: BookOpen,
      details: `${readabilityScore}% scan clarity index`,
      status: getStatus(readabilityScore),
    },
  ];

  return (
    <div className={cn("saas-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Resume Health Matrix
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Automated multi-factor evaluation across 6 core recruiting dimensions
          </p>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          6 Dimensions
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {healthItems.map((item) => {
          const StatusIcon = item.status.icon;
          const ItemIcon = item.icon;
          return (
            <div
              key={item.name}
              className={cn(
                "group relative rounded-xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5",
                item.status.border,
                item.status.bg
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-2xs">
                  <ItemIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-2xs",
                    item.status.color,
                    "bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80"
                  )}
                >
                  <StatusIcon className="h-2.5 w-2.5" />
                  <span>{item.status.label}</span>
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {item.name}
              </p>
              <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
                {item.details}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
