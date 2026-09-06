import { useEffect, useState, useRef } from "react";
import { useSearchParams, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  ArrowRight,
  XCircle,
  AlertOctagon,
  Info,
  ChevronDown,
  Wand2,
  Loader2,
  SpellCheck,
  Zap,
  LayoutTemplate,
  Key,
  LayoutDashboard,
  Layers,
  Download,
  Briefcase,
  Search,
  Filter,
  Check,
  FileText,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StrengthMeter } from "@/components/ui/StrengthMeter";
import { AtsScoreChart } from "@/components/charts/AtsScoreChart";
import { SkillsRadarChart } from "@/components/charts/SkillsRadarChart";
import { CareerWorkflowBar } from "@/components/dashboard/CareerWorkflowBar";
import { AiCopilotPanel } from "@/components/dashboard/AiCopilotPanel";
import { ResumeHealthMatrix } from "@/components/resume/ResumeHealthMatrix";
import { resumeApi } from "@/api/resume";
import { generateAnalysisReport } from "@/utils/generateReport";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import type {
  Resume,
  Analysis,
  SmartFeedbackResponse,
  SectionAnalysisResponse,
  RewriteResponse,
  IndustryDetection,
  ReadabilityResult,
  HiringProbability,
  GlobalBenchmark,
  BadgesResponse,
} from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/** Inline "Magic Wand" button — rewrites a bullet point with AI */
function MagicRewriteBtn({ text, onRewritten }: { text: string; onRewritten: (result: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleRewrite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || text.length < 5) return;
    setLoading(true);
    try {
      const result = await resumeApi.rewriteBulletPoint(text);
      onRewritten(result.rewritten);
      toast.success("Text rewritten with AI! ✨");
    } catch {
      // 403 handled globally by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRewrite}
      disabled={loading}
      title="Enhance with AI"
      className="ml-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-indigo-400 transition-all hover:bg-indigo-500/10 hover:text-indigo-500 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
    </button>
  );
}

/** Before/After block with inline Magic Wand rewrite */
function FeedbackBeforeAfter({ original, improved }: { original: string; improved: string }) {
  const [betterText, setBetterText] = useState(improved);
  const [justRewritten, setJustRewritten] = useState(false);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs dark:bg-red-900/30">❌</span>
        <p className="flex-1 text-sm text-red-700 line-through decoration-red-300 dark:text-red-400">
          {original}
        </p>
        <MagicRewriteBtn
          text={original}
          onRewritten={(text) => {
            setBetterText(text);
            setJustRewritten(true);
            setTimeout(() => setJustRewritten(false), 2000);
          }}
        />
      </div>
      <div className="flex items-center justify-center py-1">
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs dark:bg-green-900/30">✅</span>
        <motion.p
          key={betterText}
          initial={justRewritten ? { opacity: 0, y: 5 } : false}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-medium ${justRewritten ? "text-indigo-600 dark:text-indigo-400" : "text-green-700 dark:text-green-400"}`}
        >
          {betterText}
          {justRewritten && <span className="ml-1 text-xs text-indigo-400">✨ AI rewritten</span>}
        </motion.p>
      </div>
    </div>
  );
}

/** Multi-Dimensional Score Cards */
function MetricScoreCards({ analysis }: { analysis: Analysis }) {
  const m = analysis.metrics || {
    grammarScore: Math.min(Math.round(((analysis.skillsScore + analysis.experienceScore) / 2) * 1.05), 100),
    impactScore: Math.round(analysis.experienceScore * 0.9),
    formattingScore: Math.round((analysis.skillsScore + analysis.educationScore) / 2),
    keywordScore: Math.round(analysis.skillsScore * 0.95),
  };

  const cards = [
    { label: "Grammar & Precision", score: m.grammarScore, icon: SpellCheck, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/10" },
    { label: "Action & Impact", score: m.impactScore, icon: Zap, gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/10" },
    { label: "Format & ATS Layout", score: m.formattingScore, icon: LayoutTemplate, gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/10" },
    { label: "Keyword Match", score: m.keywordScore, icon: Key, gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/10" },
  ];

  const getColor = (score: number) =>
    score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const getBarColor = (score: number) =>
    score >= 75 ? "from-emerald-500 to-teal-400" : score >= 50 ? "from-amber-500 to-yellow-400" : "from-red-500 to-orange-400";
  const getLabel = (score: number) =>
    score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 50 ? "Moderate" : "Needs Attention";

  return (
    <motion.div variants={itemVariants}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="saas-card group relative overflow-hidden p-4 transition-all hover:border-brand-500/30"
          >
            <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.05] transition-opacity group-hover:opacity-[0.12]`} />
            <div className="relative">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} text-white shadow-sm`}>
                    <card.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{card.label}</span>
                </div>
                <span className={`text-base font-bold ${getColor(card.score)}`}>{card.score}%</span>
              </div>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(card.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${card.score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                />
              </div>
              <p className={`text-[10px] font-medium ${getColor(card.score)}`}>{getLabel(card.score)}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Progressive Disclosure Suggestions Card */
function SuggestionsCard({ suggestions }: { suggestions: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 3;
  const hasMore = suggestions.length > INITIAL_COUNT;
  const visible = showAll ? suggestions : suggestions.slice(0, INITIAL_COUNT);

  return (
    <motion.div variants={itemVariants}>
      <div className="saas-card overflow-hidden p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Priority Recommendations</h3>
              <p className="text-xs text-slate-500">High-impact adjustments to maximize recruiter pass rate</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-medium text-slate-500">
            {suggestions.length} items
          </Badge>
        </div>

        <div className="space-y-2.5">
          {visible.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
              className="flex gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700"
            >
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs ${
                  index < 3 ? "bg-gradient-to-br from-brand-500 to-purple-500" : "bg-slate-400 dark:bg-slate-600"
                }`}
              >
                {index + 1}
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{suggestion}</p>
            </motion.div>
          ))}

          <AnimatePresence>
            {showAll &&
              suggestions.slice(INITIAL_COUNT).map((suggestion, i) => {
                const index = i + INITIAL_COUNT;
                return (
                  <motion.div
                    key={`extra-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-400 text-[10px] font-bold text-white dark:bg-slate-600">
                        {index + 1}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{suggestion}</p>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 transition-all hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:bg-brand-900/10 dark:hover:text-brand-400"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} />
            {showAll ? "Show Fewer" : `View All ${suggestions.length} Suggestions`}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/** Grounded Resume Checklist derived strictly from real analysis results */
function ResumeImprovementChecklist({ analysis }: { analysis: Analysis }) {
  const items = [
    {
      label: "Contact & Header Information",
      status: "neutral" as const,
      desc: "Extracted from resume document header",
      tag: "Source Verified",
    },
    {
      label: "Technical Skills Section",
      status: analysis.skillsScore >= 60 && analysis.keywords.length > 0 ? ("pass" as const) : ("warn" as const),
      desc:
        analysis.keywords.length > 0
          ? `${analysis.keywords.filter((k) => !k.startsWith("(")).length} detected skills (${analysis.skillsScore}% score)`
          : `Low keyword density (${analysis.skillsScore}%)`,
      tag: analysis.skillsScore >= 60 ? "Strong" : "Needs Review",
    },
    {
      label: "Work Experience Section",
      status: analysis.experienceScore >= 60 ? ("pass" as const) : ("warn" as const),
      desc:
        analysis.experienceScore >= 60
          ? `Experience depth scored at ${analysis.experienceScore}%`
          : `Experience scored ${analysis.experienceScore}% — add quantifiable achievements`,
      tag: analysis.experienceScore >= 60 ? "Good" : "Action Needed",
    },
    {
      label: "Education & Qualifications",
      status: analysis.educationScore >= 60 ? ("pass" as const) : ("warn" as const),
      desc:
        analysis.educationScore >= 60
          ? `Education credentials validated (${analysis.educationScore}%)`
          : `Education scored ${analysis.educationScore}% — ensure degree & dates are clear`,
      tag: analysis.educationScore >= 60 ? "Verified" : "Improve",
    },
    {
      label: "Project Portfolio",
      status: analysis.projectsScore >= 60 ? ("pass" as const) : ("warn" as const),
      desc:
        analysis.projectsScore >= 60
          ? `Projects section scored ${analysis.projectsScore}%`
          : `Projects scored ${analysis.projectsScore}% — add tech stack & outcome metrics`,
      tag: analysis.projectsScore >= 60 ? "Solid" : "Expand",
    },
    {
      label: "Measurable Impact & Action Verbs",
      status:
        (analysis.metrics?.impactScore ? analysis.metrics.impactScore >= 60 : analysis.experienceScore >= 65)
          ? ("pass" as const)
          : ("warn" as const),
      desc:
        (analysis.metrics?.impactScore ? analysis.metrics.impactScore >= 60 : analysis.experienceScore >= 65)
          ? "Action verbs and quantifiable contributions present"
          : "Strengthen bullet points with metrics (%, $, numbers) and active verbs",
      tag:
        (analysis.metrics?.impactScore ? analysis.metrics.impactScore >= 60 : analysis.experienceScore >= 65)
          ? "Impactful"
          : "Action Needed",
    },
  ];

  return (
    <div className="saas-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Optimization Checklist</h3>
            <p className="text-xs text-slate-500">Verification of critical resume sections and ATS parsability</p>
          </div>
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/40 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700"
          >
            <div className="mt-0.5 shrink-0">
              {it.status === "pass" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : it.status === "warn" ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <Info className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{it.label}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                    it.status === "pass"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : it.status === "warn"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {it.tag}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Real-data Strengths & Weaknesses */
function ResumeStrengthsWeaknesses({ analysis }: { analysis: Analysis }) {
  const strengths: string[] = [];
  if (analysis.skillsScore >= 70) {
    strengths.push(`Technical skills scored ${analysis.skillsScore}%, showing solid alignment with modern tech stacks.`);
  }
  if (analysis.experienceScore >= 70) {
    strengths.push(`Work experience scored ${analysis.experienceScore}%, demonstrating strong career progression.`);
  }
  if (analysis.keywords.length >= 10) {
    strengths.push(`Detected ${analysis.keywords.filter((k) => !k.startsWith("(")).length} industry-standard keywords.`);
  }
  if (analysis.educationScore >= 70) {
    strengths.push(`Education section (${analysis.educationScore}%) is clearly formatted and structured.`);
  }
  if (analysis.projectsScore >= 70) {
    strengths.push(`Project portfolio (${analysis.projectsScore}%) highlights applied hands-on execution.`);
  }
  if (strengths.length === 0) {
    strengths.push("Baseline document parsed cleanly with standard sections intact.");
  }

  const weaknesses: string[] = [];
  if (analysis.skillsScore < 65) {
    weaknesses.push(`Skills score is ${analysis.skillsScore}% — technical keyword density could be improved.`);
  }
  if (analysis.experienceScore < 65) {
    weaknesses.push(`Work experience scored ${analysis.experienceScore}% — add quantifiable metrics (e.g. %, $) to your bullet points.`);
  }
  if (analysis.missingKeywords.length > 0) {
    weaknesses.push(
      `Missing key market keywords: ${analysis.missingKeywords
        .filter((k) => !k.startsWith("("))
        .slice(0, 4)
        .join(", ")}.`
    );
  }
  if (analysis.projectsScore < 65) {
    weaknesses.push(`Projects section (${analysis.projectsScore}%) needs more depth, tech stack callouts, and outcome metrics.`);
  }
  if (analysis.educationScore < 65) {
    weaknesses.push(`Education section scored ${analysis.educationScore}% — verify that degrees, honors, and institutions are clearly delineated.`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push("No critical section weaknesses detected; focus on role-specific tailoring.");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="saas-card border-emerald-200/60 bg-emerald-50/20 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Resume Strengths</h4>
        </div>
        <ul className="space-y-2">
          {strengths.map((str, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="leading-relaxed">{str}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="saas-card border-amber-200/60 bg-amber-50/20 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Areas for Improvement</h4>
        </div>
        <ul className="space-y-2">
          {weaknesses.map((wk, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              <span className="leading-relaxed">{wk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Categorized AI Recommendations */
function CategorizedRecommendations({
  suggestions,
  missingKeywords,
}: {
  suggestions: string[];
  missingKeywords: string[];
}) {
  const skillCategory = suggestions.filter((s) =>
    /skill|keyword|technolog|tool|stack|language|framework|python|react|java|cloud/i.test(s)
  );
  const expCategory = suggestions.filter((s) =>
    /experience|metric|quantif|achievement|impact|bullet|verb|result|work|lead|manag/i.test(s)
  );
  const structureCategory = suggestions.filter((s) =>
    /format|summary|structure|layout|education|project|header|section|readab/i.test(s)
  );
  const generalCategory = suggestions.filter(
    (s) =>
      !skillCategory.includes(s) &&
      !expCategory.includes(s) &&
      !structureCategory.includes(s)
  );

  const categories = [
    {
      title: "Skills & Keywords",
      icon: Key,
      color: "text-purple-500",
      items: skillCategory,
      badge: `${skillCategory.length} tips`,
    },
    {
      title: "Experience & Impact",
      icon: Zap,
      color: "text-amber-500",
      items: expCategory,
      badge: `${expCategory.length} tips`,
    },
    {
      title: "Structure & Layout",
      icon: LayoutTemplate,
      color: "text-blue-500",
      items: structureCategory,
      badge: `${structureCategory.length} tips`,
    },
    {
      title: "General Polish",
      icon: Lightbulb,
      color: "text-emerald-500",
      items: generalCategory,
      badge: `${generalCategory.length} tips`,
    },
  ].filter((c) => c.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.title} className="saas-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{cat.title}</h4>
              </div>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {cat.badge}
              </span>
            </div>
            <ul className="space-y-2">
              {cat.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {missingKeywords.length > 0 && (
        <div className="saas-card p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Recommended High-Yield Keywords</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords
              .filter((k) => !k.startsWith("("))
              .map((kw) => (
                <Badge key={kw} variant="warning" className="text-xs font-normal">
                  + {kw}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Interactive Visual Skills Intelligence Map */
function SkillsIntelligenceMap({
  keywords,
  missingKeywords,
}: {
  keywords: string[];
  missingKeywords: string[];
}) {
  const [activeFilter, setActiveFilter] = useState<"all" | "matched" | "missing">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const matchedSkills = keywords
    .filter((k) => !k.startsWith("("))
    .map((k) => ({
      name: /^soft:/i.test(k) ? k.replace(/^soft:\s*/i, "") : k,
      raw: k,
      type: "matched" as const,
      isSoft: /^soft:/i.test(k),
    }));

  const gapSkills = missingKeywords
    .filter((k) => !k.startsWith("("))
    .map((k) => ({
      name: k,
      raw: k,
      type: "missing" as const,
      isSoft: false,
    }));

  const allSkills = [...matchedSkills, ...gapSkills];

  const filtered = allSkills.filter((s) => {
    if (activeFilter === "matched" && s.type !== "matched") return false;
    if (activeFilter === "missing" && s.type !== "missing") return false;
    if (searchQuery.trim() && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="saas-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Skills Intelligence Map</h3>
            <p className="text-xs text-slate-500">
              {matchedSkills.length} verified competencies &bull; {gapSkills.length} high-yield opportunities
            </p>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill..."
              className="h-8 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              All ({allSkills.length})
            </button>
            <button
              onClick={() => setActiveFilter("matched")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                activeFilter === "matched"
                  ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              Matched ({matchedSkills.length})
            </button>
            <button
              onClick={() => setActiveFilter("missing")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                activeFilter === "missing"
                  ? "bg-white text-amber-600 shadow-xs dark:bg-slate-800 dark:text-amber-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              Missing ({gapSkills.length})
            </button>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((skill, i) => (
            <motion.div
              key={`${skill.name}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
            >
              {skill.type === "matched" ? (
                <span
                  className={cn(
                    "tech-badge inline-flex items-center gap-1 border",
                    skill.isSoft
                      ? "border-blue-200 bg-blue-50/70 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300"
                      : "border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                  )}
                >
                  <Check className="h-3 w-3 text-emerald-500" />
                  {skill.name}
                  {skill.isSoft && <span className="text-[9px] opacity-70">&bull; soft</span>}
                </span>
              ) : (
                <span className="tech-badge inline-flex items-center gap-1 border border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">+</span>
                  {skill.name}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
          No skills match the query "{searchQuery}"
        </div>
      )}
    </div>
  );
}

export function ResumeAnalysisPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resumeId = searchParams.get("resumeId");
  const isSample = searchParams.get("sample") === "true";
  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartFeedback, setSmartFeedback] = useState<SmartFeedbackResponse | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [sectionData, setSectionData] = useState<SectionAnalysisResponse | null>(null);
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  const [rewriteInput, setRewriteInput] = useState("");
  const [rewriteResult, setRewriteResult] = useState<RewriteResponse | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [industryData, setIndustryData] = useState<IndustryDetection | null>(null);
  const [isIndustryLoading, setIsIndustryLoading] = useState(false);
  const [readabilityData, setReadabilityData] = useState<ReadabilityResult | null>(null);
  const [isReadabilityLoading, setIsReadabilityLoading] = useState(false);
  const [hiringData, setHiringData] = useState<HiringProbability | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<GlobalBenchmark | null>(null);
  const [badgesData, setBadgesData] = useState<BadgesResponse | null>(null);
  const [loadingStage, setLoadingStage] = useState("");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "recommendations" | "deep-dive">("overview");

  const extrasFetchKeyRef = useRef<string | null>(null);
  const analyzeRequestLockRef = useRef(false);

  useEffect(() => {
    extrasFetchKeyRef.current = null;
  }, [resumeId]);

  useEffect(() => {
    if (isSample) {
      const st = (location.state as { sampleData?: { id: string; atsScore: number; fileName: string; analysis: Analysis } } | null)?.sampleData;
      if (st) {
        setResume({ id: st.id, userId: "", fileUrl: "", fileName: st.fileName, atsScore: st.atsScore, createdAt: new Date().toISOString(), analysis: st.analysis });
        setAnalysis(st.analysis);
        return;
      }
    }

    if (resumeId) {
      setIsLoading(true);
      resumeApi
        .getById(resumeId)
        .then((data) => {
          setResume(data);
          if (data.analysis) {
            setAnalysis(data.analysis);
          }
        })
        .catch(() => {
          toast.error("Failed to load resume");
        })
        .finally(() => setIsLoading(false));
    }
  }, [resumeId, isSample, location.key]);

  const LOADING_STAGES = [
    "Extracting document structure...",
    "Parsing work history & bullet points...",
    "Running NLP keyword density models...",
    "Evaluating ATS syntax & format rules...",
    "Computing predictive section benchmarks...",
    "Formulating precision AI recommendations...",
  ];

  const handleAnalyze = async () => {
    if (!resumeId || analyzeRequestLockRef.current) return;
    analyzeRequestLockRef.current = true;
    setIsAnalyzing(true);
    setLoadingStage(LOADING_STAGES[0]);

    let stageInterval: ReturnType<typeof setInterval> | undefined;
    let stageIdx = 0;
    stageInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % LOADING_STAGES.length;
      setLoadingStage(LOADING_STAGES[stageIdx]);
    }, 2400);

    try {
      const result = await resumeApi.analyze(resumeId);
      setLoadingStage("Analysis complete!");
      setAnalysis(result);
      const updatedResume = await resumeApi.getById(resumeId);
      setResume(updatedResume);
      toast.success("Resume Intelligence Analysis complete!", {
        description: `ATS Score: ${updatedResume.atsScore}%`,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Analysis failed. Please try again.";
      toast.error(msg);
    } finally {
      if (stageInterval) clearInterval(stageInterval);
      analyzeRequestLockRef.current = false;
      setIsAnalyzing(false);
      setLoadingStage("");
    }
  };

  useEffect(() => {
    if (!analysis || !resumeId || !resume) return;

    const key = [
      resumeId,
      resume.atsScore ?? "null",
      analysis.skillsScore,
      analysis.experienceScore,
      analysis.educationScore,
      analysis.projectsScore,
    ].join("|");

    if (extrasFetchKeyRef.current === key) return;
    extrasFetchKeyRef.current = key;

    let cancelled = false;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      try {
        const h = await resumeApi.getHiringProbability(resumeId);
        if (cancelled) return;
        setHiringData(h);
        await delay(350);
        const b = await resumeApi.getGlobalBenchmark(resumeId);
        if (cancelled) return;
        setBenchmarkData(b);
        await delay(350);
        const bad = await resumeApi.getBadges(resumeId);
        if (cancelled) return;
        setBadgesData(bad);
      } catch {
        /* keep prior state */
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [analysis, resumeId, resume]);

  if (!resumeId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <FileSearch className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
        </motion.div>
        <h2 className="mb-1.5 text-xl font-semibold text-slate-900 dark:text-white">No Resume Selected</h2>
        <p className="mb-6 text-sm text-slate-500">Upload or choose a resume to enter the Intelligence Workspace</p>
        <Link to="/upload">
          <Button className="gap-2 shadow-sm">
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 lg:col-span-8" />
          <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 lg:col-span-4" />
        </div>
      </div>
    );
  }

  const sectionSum = analysis
    ? analysis.skillsScore + analysis.experienceScore + analysis.educationScore + analysis.projectsScore
    : 0;
  const canonicalAts = Math.max(0, Math.min(100, Math.round(Number(resume?.atsScore ?? 0))));
  const atsValue = canonicalAts;
  const isAnalysisDegenerate = !!analysis && (sectionSum <= 5 || (atsValue < 5 && sectionSum < 30));

  const handleCopilotAction = (actionId: string) => {
    if (actionId === "fix-keywords") {
      setActiveTab("overview");
      toast.info("Showing skills map and missing keywords below");
    } else if (actionId === "boost-experience") {
      setActiveTab("recommendations");
      toast.info("Opened AI Rewriter & Smart Feedback");
    } else if (actionId === "boost-projects") {
      setActiveTab("deep-dive");
      toast.info("Opened Section Deep Dive");
    } else if (actionId === "match-job") {
      navigate(`/job-match?resumeId=${resumeId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 6-Stage Pipeline Bar */}
      <CareerWorkflowBar currentStage={2} resumeId={resumeId || undefined} />

      {/* Top Intelligence Header */}
      <div className="saas-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="tech-badge border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                Stage 02 &bull; Intelligence Workspace
              </span>
              {resume?.fileName && (
                <span className="tech-badge border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <FileText className="mr-1 h-3 w-3 text-slate-400" />
                  {resume.fileName}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resume Intelligence Workspace
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Multi-dimensional ATS verification, neural skill graphs, and actionable rewriting tools
            </p>
          </div>

          {/* Action Bar */}
          {analysis ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={isAnalyzing}
                className="gap-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Re-Analyze
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                isLoading={isPdfGenerating}
                onClick={() => {
                  if (!analysis || !resume) return;
                  setIsPdfGenerating(true);
                  try {
                    generateAnalysisReport(analysis, resume.fileName, canonicalAts, user?.name || "Candidate");
                    toast.success("Executive PDF report generated!");
                  } catch (err) {
                    console.error("[PDF] Generation failed:", err);
                    toast.error("Failed to generate PDF");
                  } finally {
                    setIsPdfGenerating(false);
                  }
                }}
              >
                <Download className="h-3.5 w-3.5" />
                PDF Report
              </Button>
              <Link to={`/job-match?resumeId=${resumeId}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Briefcase className="h-3.5 w-3.5" />
                  Match with Job
                </Button>
              </Link>
              <Link to="/interview-prep">
                <Button size="sm" className="gap-1.5 text-xs shadow-sm">
                  <Target className="h-3.5 w-3.5" />
                  Interview Prep
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={isAnalyzing}
              className="gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Resume
            </Button>
          )}
        </div>
      </div>

      {/* Degenerate Warning Banner */}
      {isAnalysisDegenerate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  This analysis looks incomplete
                </p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/90">
                  Sections scored near zero, which typically indicates the document text could not be extracted (often
                  occurs with image-scanned PDFs). Try re-running or upload a digital text PDF.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button onClick={handleAnalyze} isLoading={isAnalyzing} disabled={isAnalyzing} size="sm" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Re-run analysis
              </Button>
              <Link to="/upload">
                <Button size="sm" variant="outline" className="gap-2">
                  <Upload className="h-3.5 w-3.5" />
                  Re-upload
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Workspace Split */}
      <AnimatePresence mode="wait">
        {analysis ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Center Area (8 cols) */}
            <div className="space-y-6 lg:col-span-8">
              {/* Segmented Workspace Controller */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    activeTab === "overview"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Overview & Skills</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("recommendations")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    activeTab === "recommendations"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  <span>AI Actions & Rewriter</span>
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {analysis.suggestions.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("deep-dive")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
                    activeTab === "deep-dive"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Deep Dive & Benchmark</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW & SKILLS MAP */}
              {activeTab === "overview" && (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                  {/* Gauge & Radar Grid */}
                  <div className="grid min-w-0 gap-4 sm:grid-cols-3">
                    <div className="min-w-0">
                      <AtsScoreChart score={canonicalAts} />
                    </div>
                    <div className="min-w-0">
                      <StrengthMeter
                        score={canonicalAts}
                        skillsScore={analysis.skillsScore}
                        experienceScore={analysis.experienceScore}
                        educationScore={analysis.educationScore}
                        projectsScore={analysis.projectsScore}
                      />
                    </div>
                    <div className="min-w-0">
                      <SkillsRadarChart
                        skills={analysis.skillsScore}
                        experience={analysis.experienceScore}
                        education={analysis.educationScore}
                        projects={analysis.projectsScore}
                        headlineAts={canonicalAts}
                      />
                    </div>
                  </div>

                  {/* High-Tech 6-Dimension Health Matrix */}
                  <ResumeHealthMatrix analysis={analysis} atsScore={canonicalAts} />

                  {/* Multi-Dimensional Metrics */}
                  <MetricScoreCards analysis={analysis} />

                  {/* Interactive Skills Intelligence Map */}
                  <SkillsIntelligenceMap
                    keywords={analysis.keywords}
                    missingKeywords={analysis.missingKeywords}
                  />

                  {/* Verification Checklist */}
                  <ResumeImprovementChecklist analysis={analysis} />

                  {/* Strengths & Weaknesses */}
                  <ResumeStrengthsWeaknesses analysis={analysis} />
                </motion.div>
              )}

              {/* TAB 2: AI ACTIONS & REWRITER */}
              {activeTab === "recommendations" && (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                  {/* ═══ AI RESUME REWRITER ═══ */}
                  <div className="saas-card p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                          <Wand2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Bullet Rewriter</h3>
                          <p className="text-xs text-slate-500">
                            Transform weak bullets into high-impact, quantified achievement statements
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2.5">
                        <textarea
                          value={rewriteInput}
                          onChange={(e) => setRewriteInput(e.target.value)}
                          placeholder="e.g. Handled customer support queries and helped improve satisfaction."
                          rows={2}
                          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        />
                        <Button
                          onClick={async () => {
                            if (!rewriteInput.trim()) return;
                            setIsRewriting(true);
                            try {
                              const result = await resumeApi.rewriteBulletPoint(rewriteInput);
                              setRewriteResult(result);
                              toast.success("Rewritten with metrics!");
                            } catch {
                              toast.error("Rewrite failed");
                            } finally {
                              setIsRewriting(false);
                            }
                          }}
                          isLoading={isRewriting}
                          disabled={!rewriteInput.trim()}
                          className="self-end text-xs shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Rewrite
                        </Button>
                      </div>

                      <AnimatePresence>
                        {rewriteResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] dark:bg-red-900/30">
                                ❌
                              </span>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Original</p>
                                <p className="text-xs text-red-700 line-through decoration-red-300 dark:text-red-400">
                                  {rewriteResult.original}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-center">
                              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] dark:bg-emerald-900/30">
                                ✅
                              </span>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">AI Enhanced</p>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                  {rewriteResult.rewritten}
                                </p>
                              </div>
                            </div>

                            {rewriteResult.changes.length > 0 && (
                              <div className="border-t border-slate-200/80 pt-2.5 dark:border-slate-800">
                                <p className="mb-1 text-[10px] font-semibold text-slate-500">Key Enhancements</p>
                                <div className="flex flex-wrap gap-1">
                                  {rewriteResult.changes.map((c, i) => (
                                    <Badge key={i} variant="default" className="text-[10px]">
                                      {c}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Smart Feedback line-by-line */}
                  <div className="saas-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                          <AlertOctagon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Smart Feedback</h3>
                          <p className="text-xs text-slate-500">Line-by-line diagnosis with one-click AI fixes</p>
                        </div>
                      </div>
                      {!smartFeedback && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!resumeId) return;
                            setIsFeedbackLoading(true);
                            toast.loading("Scanning resume text...", { id: "feedback" });
                            try {
                              const result = await resumeApi.getSmartFeedback(resumeId);
                              setSmartFeedback(result);
                              toast.success(`Found ${result.issuesFound} targeted improvements!`, { id: "feedback" });
                            } catch {
                              toast.error("Feedback failed", { id: "feedback" });
                            } finally {
                              setIsFeedbackLoading(false);
                            }
                          }}
                          isLoading={isFeedbackLoading}
                          className="text-xs shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Scan Line-by-Line
                        </Button>
                      )}
                    </div>

                    {smartFeedback ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                              {smartFeedback.score}%
                            </span>
                            <span className="text-xs text-slate-500">Writing Score</span>
                          </div>
                          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                          <span className="text-xs text-slate-500">{smartFeedback.totalLinesScanned} lines parsed</span>
                          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                          <div className="flex gap-1.5">
                            {smartFeedback.summary.high > 0 && (
                              <Badge variant="danger">{smartFeedback.summary.high} High</Badge>
                            )}
                            {smartFeedback.summary.medium > 0 && (
                              <Badge variant="warning">{smartFeedback.summary.medium} Med</Badge>
                            )}
                            {smartFeedback.summary.low > 0 && (
                              <Badge variant="secondary">{smartFeedback.summary.low} Low</Badge>
                            )}
                          </div>
                        </div>

                        {smartFeedback.feedback.length > 0 ? (
                          <div className="space-y-2.5">
                            {smartFeedback.feedback.map((item, i) => (
                              <div
                                key={i}
                                className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                              >
                                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3.5 py-1.5 dark:border-slate-800 dark:bg-slate-900/60">
                                  {item.severity === "high" ? (
                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                  ) : item.severity === "medium" ? (
                                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                                  ) : (
                                    <Info className="h-3.5 w-3.5 text-blue-500" />
                                  )}
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {item.issue}
                                  </span>
                                  <Badge
                                    variant={
                                      item.severity === "high"
                                        ? "danger"
                                        : item.severity === "medium"
                                        ? "warning"
                                        : "secondary"
                                    }
                                    className="ml-auto text-[10px]"
                                  >
                                    {item.severity}
                                  </Badge>
                                </div>
                                <FeedbackBeforeAfter original={item.original} improved={item.improved} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-500">
                            <CheckCircle2 className="mx-auto mb-1.5 h-7 w-7 text-emerald-500" />
                            Clean writing detected across all analyzed bullet points!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Sparkles className="mb-2 h-7 w-7 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          Click "Scan Line-by-Line" to run neural linting across your bullet points
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Categorized Recommendations */}
                  <CategorizedRecommendations
                    suggestions={analysis.suggestions}
                    missingKeywords={analysis.missingKeywords}
                  />

                  {/* Progressive Disclosure Suggestions */}
                  <SuggestionsCard suggestions={analysis.suggestions} />
                </motion.div>
              )}

              {/* TAB 3: DEEP DIVE & BENCHMARK */}
              {activeTab === "deep-dive" && (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                  {/* Section Analyzer */}
                  <div className="saas-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Section Grader</h3>
                          <p className="text-xs text-slate-500">Per-section ATS scoring and qualitative recommendations</p>
                        </div>
                      </div>
                      {!sectionData && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!resumeId) return;
                            setIsSectionLoading(true);
                            toast.loading("Analyzing section syntax...", { id: "sections" });
                            try {
                              const result = await resumeApi.analyzeSections(resumeId);
                              setSectionData(result);
                              toast.success("Section analysis complete!", { id: "sections" });
                            } catch {
                              toast.error("Section analysis failed", { id: "sections" });
                            } finally {
                              setIsSectionLoading(false);
                            }
                          }}
                          isLoading={isSectionLoading}
                          className="text-xs shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Evaluate Sections
                        </Button>
                      )}
                    </div>

                    {sectionData ? (
                      <div className="space-y-3">
                        {sectionData.sections.map((section, i) => {
                          const masterScoreMap: Record<string, number | undefined> = analysis
                            ? {
                                Summary: analysis.skillsScore,
                                Skills: analysis.skillsScore,
                                Experience: analysis.experienceScore,
                                Education: analysis.educationScore,
                                Projects: analysis.projectsScore,
                              }
                            : {};
                          const score = masterScoreMap[section.name] ?? section.score;
                          const grade =
                            score >= 90
                              ? "A+"
                              : score >= 80
                              ? "A"
                              : score >= 70
                              ? "B"
                              : score >= 60
                              ? "C"
                              : score >= 40
                              ? "D"
                              : "F";
                          const gradeColor =
                            grade === "A+" || grade === "A"
                              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                              : grade === "B"
                              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                              : grade === "C"
                              ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                              : "text-red-600 bg-red-50 dark:bg-red-950/30";

                          return (
                            <div
                              key={section.name}
                              className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${gradeColor}`}
                                  >
                                    {grade}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{section.name}</span>
                                  {!section.found && (
                                    <Badge variant="danger" className="text-[9px]">
                                      Missing
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{score}%</span>
                              </div>
                              <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.05 }}
                                />
                              </div>
                              {section.tips.length > 0 && (
                                <p className="text-[11px] text-slate-500">{section.tips[0]}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500">
                        Click "Evaluate Sections" to audit each resume section
                      </div>
                    )}
                  </div>

                  {/* Industry & Readability */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Industry */}
                    <div className="saas-card p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">🏢 Industry Alignment</h4>
                        {!industryData && (
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={isIndustryLoading}
                            onClick={async () => {
                              if (!resumeId) return;
                              setIsIndustryLoading(true);
                              try {
                                const r = await resumeApi.detectIndustry(resumeId);
                                setIndustryData(r);
                                toast.success(`Detected: ${r.primaryField}`);
                              } catch {
                                toast.error("Industry detection failed");
                              } finally {
                                setIsIndustryLoading(false);
                              }
                            }}
                            className="text-xs"
                          >
                            Detect
                          </Button>
                        )}
                      </div>
                      {industryData ? (
                        <div className="space-y-2">
                          <div className="rounded-lg bg-brand-50/50 p-2.5 text-center dark:bg-brand-950/20">
                            <p className="text-[10px] text-slate-500">Primary Domain</p>
                            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                              {industryData.primaryField}
                            </p>
                          </div>
                          {industryData.detectedIndustries.slice(0, 2).map((ind) => (
                            <div key={ind.name} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-400">{ind.name}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {ind.confidence}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-500">Click Detect to identify target industry</p>
                      )}
                    </div>

                    {/* Readability */}
                    <div className="saas-card p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">📖 Readability Grade</h4>
                        {!readabilityData && (
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={isReadabilityLoading}
                            onClick={async () => {
                              if (!resumeId) return;
                              setIsReadabilityLoading(true);
                              try {
                                const r = await resumeApi.analyzeReadability(resumeId);
                                setReadabilityData(r);
                                toast.success(`Readability: Grade ${r.grade}`);
                              } catch {
                                toast.error("Readability failed");
                              } finally {
                                setIsReadabilityLoading(false);
                              }
                            }}
                            className="text-xs"
                          >
                            Analyze
                          </Button>
                        )}
                      </div>
                      {readabilityData ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                              {readabilityData.score}%
                            </span>
                            <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                              Grade {readabilityData.grade}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-center text-[10px]">
                            <div className="rounded bg-slate-100 p-1.5 dark:bg-slate-800">
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {readabilityData.metrics.avgSentenceLength}w
                              </p>
                              <p className="text-slate-500">Avg Sentence</p>
                            </div>
                            <div className="rounded bg-slate-100 p-1.5 dark:bg-slate-800">
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {readabilityData.metrics.passiveVoice}
                              </p>
                              <p className="text-slate-500">Passive Verbs</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-500">Click Analyze to test reading ease</p>
                      )}
                    </div>
                  </div>

                  {/* Benchmark & Probability */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Hiring Probability */}
                    <div className="saas-card p-4">
                      <h4 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">📊 Interview Probability</h4>
                      {hiringData ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {hiringData.probability}%
                            </span>
                            <span className="text-xs text-slate-500">{hiringData.verdict}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Predictive index based on market standards and section weights
                          </p>
                        </div>
                      ) : (
                        <div className="h-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      )}
                    </div>

                    {/* Global Benchmark */}
                    <div className="saas-card p-4">
                      <h4 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">🌍 Global Peer Benchmark</h4>
                      {benchmarkData ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                              Top {100 - benchmarkData.beatsPercent}%
                            </span>
                            <span className="text-xs text-slate-500">{benchmarkData.rank}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Outperforms {benchmarkData.beatsPercent}% of resumes in similar engineering roles
                          </p>
                        </div>
                      ) : (
                        <div className="h-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Copilot Rail (4 cols) */}
            <div className="space-y-6 lg:col-span-4">
              <AiCopilotPanel resume={resume} analysis={analysis} onActionClick={handleCopilotAction} />

              {/* Next Step Launchpad Card */}
              <div className="saas-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Career Progression</h4>
                    <p className="text-[10px] text-slate-500">Continue through the pipeline</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link to={`/job-match?resumeId=${resumeId}`} className="block">
                    <button className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/20 dark:border-slate-800 dark:bg-slate-900/40">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">03 &bull; Match With Job</p>
                        <p className="text-[10px] text-slate-500">Compare against target job description</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </Link>
                  <Link to="/interview-prep" className="block">
                    <button className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/20 dark:border-slate-800 dark:bg-slate-900/40">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">06 &bull; Prepare Interview</p>
                        <p className="text-[10px] text-slate-500">Generate targeted technical Q&A</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Initial State */
          <div className="saas-card flex flex-col items-center justify-center py-16 text-center">
            {isAnalyzing ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <motion.div
                    className="h-16 w-16 rounded-full border-4 border-brand-500/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-1.5 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-brand-500" />
                  </div>
                </div>
                <p className="mb-1 text-sm font-semibold text-brand-600 dark:text-brand-400">{loadingStage}</p>
                <p className="text-xs text-slate-500">Generating intelligence insights...</p>
              </div>
            ) : (
              <div>
                <Sparkles className="mx-auto mb-3 h-12 w-12 text-brand-400" />
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Ready for Deep Intelligence</h3>
                <p className="mb-5 text-xs text-slate-500">
                  Analyze sections, measure ATS compatibility, and uncover skill gaps
                </p>
                <Button onClick={handleAnalyze} isLoading={isAnalyzing} disabled={isAnalyzing} className="gap-2 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Run AI Analysis
                </Button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
