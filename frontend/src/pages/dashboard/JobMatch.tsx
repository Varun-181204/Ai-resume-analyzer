import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Upload,
  TrendingUp,
  Link2,
  FileText,
  Search,
  Sparkles,
  ExternalLink,
  Check,
  Target,
  Layers,
  ChevronRight,
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
import { JobMatchBarChart } from "@/components/charts/JobMatchBarChart";
import { CareerWorkflowBar } from "@/components/dashboard/CareerWorkflowBar";
import { resumeApi } from "@/api/resume";
import type { Resume, JobMatch } from "@/types";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

function SkillGapCircle({ percent, label }: { percent: number; label: string }) {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (percent / 100) * circumference;
  const color =
    percent >= 80
      ? "#10b981"
      : percent >= 60
      ? "#0ea5e9"
      : percent >= 40
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r="38"
          stroke="currentColor"
          strokeWidth="7"
          fill="none"
          className="text-slate-200 dark:text-slate-800"
        />
        <motion.circle
          cx="48"
          cy="48"
          r="38"
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tracking-tight" style={{ color }}>
          {percent}%
        </span>
        <span className="text-[10px] font-medium text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export function JobMatchPage() {
  const [searchParams] = useSearchParams();
  const paramResumeId = searchParams.get("resumeId") || searchParams.get("id");

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [inputMode, setInputMode] = useState<"paste" | "url">("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [urlResult, setUrlResult] = useState<{ matchPercentage: number; missingKeywords: string[]; recommendation: string } | null>(null);
  const [isUrlMatching, setIsUrlMatching] = useState(false);
  const [skillFilter, setSkillFilter] = useState<"all" | "matched" | "missing">("all");
  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    resumeApi
      .getHistory()
      .then((data) => {
        setResumes(data);
        if (data.length > 0) {
          if (paramResumeId && data.some((r) => r.id === paramResumeId)) {
            setSelectedResumeId(paramResumeId);
          } else {
            setSelectedResumeId(data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [paramResumeId]);

  const handleMatch = async () => {
    if (!selectedResumeId || !jobDescription.trim()) return;
    setIsMatching(true);
    toast.loading("Analyzing skill alignment...", { id: "matching" });
    try {
      const result = await resumeApi.matchJob(selectedResumeId, jobDescription);
      setMatchResult(result);
      toast.success("Job match analysis complete!", {
        id: "matching",
        description: `Skill match: ${result.skillMatch}%`,
      });
    } catch {
      toast.error("Matching failed", { id: "matching" });
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <SkeletonCard className="h-48" />
        <SkeletonText lines={3} />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Briefcase className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
        <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">No Resumes Found</h2>
        <p className="mb-6 text-xs text-slate-500">Upload a resume to analyze target job matches</p>
        <Link to="/upload">
          <Button className="gap-2 shadow-sm">
            <Upload className="h-4 w-4" /> Upload Resume
          </Button>
        </Link>
      </div>
    );
  }

  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      {/* 6-Stage Pipeline Bar */}
      <CareerWorkflowBar currentStage={3} resumeId={selectedResumeId || undefined} />

      {/* Header Banner */}
      <div className="saas-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="tech-badge border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                Stage 03 &bull; Job Match & Targeting
              </span>
              {activeResume && (
                <span className="tech-badge border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <FileText className="mr-1 h-3 w-3 text-slate-400" />
                  {activeResume.fileName}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Target Job Alignment & Skill Gap Analysis
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Benchmark your qualifications against specific job descriptions or live postings to uncover key advantages
            </p>
          </div>
          {activeResume?.atsScore != null && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Baseline ATS</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{activeResume.atsScore}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="saas-card overflow-hidden">
        {/* Modern Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
          {[
            { key: "paste" as const, label: "Paste Job Description", icon: FileText },
            { key: "url" as const, label: "Live Job Posting URL", icon: Link2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setInputMode(tab.key);
                setMatchResult(null);
                setUrlResult(null);
              }}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors",
                inputMode === tab.key
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <tab.icon className="h-4 w-4 text-brand-500" />
              <span>{tab.label}</span>
              {inputMode === tab.key && (
                <motion.div
                  layoutId="jm-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {/* Target Resume Picker */}
          <div className="mb-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Evaluation Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fileName} (ATS: {r.atsScore ?? "--"}%) &bull; {new Date(r.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === "paste" ? (
              <motion.div
                key="paste"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Job Description / Requirements
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job posting, tech stack, responsibilities, or minimum qualifications here..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
                <Button
                  className="gap-2 text-xs shadow-sm"
                  onClick={handleMatch}
                  isLoading={isMatching}
                  disabled={!selectedResumeId || !jobDescription.trim()}
                >
                  <Send className="h-3.5 w-3.5" /> Analyze Match & Gaps
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Live Job URL (LinkedIn, Indeed, Lever, Greenhouse)
                  </label>
                  <input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <p className="text-[11px] text-slate-400">
                    Our AI scraper fetches the public requirements from the job board automatically.
                  </p>
                </div>
                <Button
                  className="gap-2 text-xs shadow-sm"
                  isLoading={isUrlMatching}
                  disabled={!selectedResumeId || !jobUrl.trim()}
                  onClick={async () => {
                    if (!selectedResumeId || !jobUrl.trim()) return;
                    setIsUrlMatching(true);
                    setUrlResult(null);
                    toast.loading("Fetching job page & evaluating...", { id: "url-match" });
                    try {
                      const result = await resumeApi.matchUrl(selectedResumeId, jobUrl);
                      setUrlResult(result);
                      toast.success(`Job Match: ${result.matchPercentage}%`, { id: "url-match" });
                    } catch (err: unknown) {
                      const error = err as { response?: { data?: { message?: string } } };
                      toast.error(error.response?.data?.message || "Failed to analyze URL", { id: "url-match" });
                    } finally {
                      setIsUrlMatching(false);
                    }
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" /> {isUrlMatching ? "Extracting & Analyzing..." : "Extract & Match URL"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* URL Match Results */}
      {urlResult && inputMode === "url" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="saas-card p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <SkillGapCircle percent={urlResult.matchPercentage} label="Target Match" />
              <div className="flex-1">
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                  {urlResult.matchPercentage >= 80
                    ? "Exceptional Candidate Alignment 🎉"
                    : urlResult.matchPercentage >= 50
                    ? "Solid Foundation & Partial Overlap 👍"
                    : "Significant Skill Gap Detected 📝"}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{urlResult.recommendation}</p>
              </div>
            </div>

            {urlResult.missingKeywords.length > 0 && (
              <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                <h4 className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">
                  Identified Missing Skill Requirements ({urlResult.missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {urlResult.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="tech-badge border border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link to="/cover-letter">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Generate Tailored Cover Letter
                </Button>
              </Link>
              <Link to="/interview-prep">
                <Button size="sm" className="gap-1.5 text-xs shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Interview Questions
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Match Results */}
      <AnimatePresence mode="wait">
        {matchResult ? (
          <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Centerpiece Hero Match Card */}
            <div className="saas-card overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-brand-50/30 p-5 sm:p-6 dark:border-slate-800 dark:from-slate-900/50 dark:to-brand-950/20">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="tech-badge border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                      Alignment Scorecard
                    </span>
                    <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      Job Match & Competency Gap
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Cross-referenced against role requirements, experience depth, and education
                    </p>
                  </div>
                  {/* Dual Dials */}
                  <div className="flex items-center gap-4">
                    <SkillGapCircle
                      percent={
                        matchResult.keywordsFound.length + matchResult.missingKeywords.length > 0
                          ? Math.round(
                              (matchResult.keywordsFound.length /
                                (matchResult.keywordsFound.length + matchResult.missingKeywords.length)) *
                                100
                            )
                          : 0
                      }
                      label="Skill Coverage"
                    />
                    <SkillGapCircle percent={matchResult.overallScore} label="Weighted ATS" />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* 3 Metric Summary Pills */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-3.5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {matchResult.keywordsFound.length}
                    </p>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Matched Competencies</p>
                  </div>
                  <div className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-3.5 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {matchResult.missingKeywords.length}
                    </p>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Target Skill Gaps</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-center dark:border-slate-800 dark:bg-slate-900/30">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {matchResult.keywordsFound.length + matchResult.missingKeywords.length}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Role Requirements</p>
                  </div>
                </div>

                {/* Side-by-Side Strengths vs Gaps View */}
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                  {/* Verified Strengths */}
                  <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/20 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          Verified Match Strengths ({matchResult.keywordsFound.length})
                        </h4>
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        In Resume
                      </Badge>
                    </div>
                    {matchResult.keywordsFound.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.keywordsFound.map((kw) => (
                          <span
                            key={kw}
                            className="tech-badge border border-emerald-200 bg-white text-emerald-800 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <Check className="mr-1 h-3 w-3 text-emerald-500" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No overlapping keywords found in job description.</p>
                    )}
                  </div>

                  {/* Skill Gaps */}
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/20 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Critical Skill Gaps to Bridge ({matchResult.missingKeywords.length})
                        </h4>
                      </div>
                      <Badge variant="warning" className="text-[10px]">
                        Opportunity
                      </Badge>
                    </div>
                    {matchResult.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="tech-badge border border-amber-200 bg-white text-amber-800 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Zero skill gaps! You match all detected requirements.
                      </p>
                    )}
                  </div>
                </div>

                {/* Filterable Skill-by-Skill Breakdown Table */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Detailed Skill-by-Skill ATS Verification
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Examine how ATS filters parse individual competencies from the job description
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-800 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setSkillFilter("all")}
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                            skillFilter === "all"
                              ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                          )}
                        >
                          All ({matchResult.keywordsFound.length + matchResult.missingKeywords.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkillFilter("matched")}
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                            skillFilter === "matched"
                              ? "bg-white text-emerald-600 shadow-2xs dark:bg-slate-800 dark:text-emerald-400"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                          )}
                        >
                          Matched ({matchResult.keywordsFound.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkillFilter("missing")}
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                            skillFilter === "missing"
                              ? "bg-white text-amber-600 shadow-2xs dark:bg-slate-800 dark:text-amber-400"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                          )}
                        >
                          Missing ({matchResult.missingKeywords.length})
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          placeholder="Filter skills..."
                          className="h-7.5 w-36 rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="min-w-[22rem]">
                      <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
                        <span>Role Requirement</span>
                        <span className="w-24 text-center">Status</span>
                        <span className="w-32 text-center">ATS Match</span>
                      </div>

                      {(() => {
                        const showMatched = skillFilter === "all" || skillFilter === "matched";
                        const showMissing = skillFilter === "all" || skillFilter === "missing";
                        const q = skillSearch.toLowerCase().trim();

                        const matchedItems = showMatched
                          ? matchResult.keywordsFound.filter((s) => !q || s.toLowerCase().includes(q))
                          : [];
                        const missingItems = showMissing
                          ? matchResult.missingKeywords.filter((s) => !q || s.toLowerCase().includes(q))
                          : [];

                        if (matchedItems.length === 0 && missingItems.length === 0) {
                          return (
                            <div className="py-8 text-center text-xs text-slate-500">
                              No requirements match the search filter.
                            </div>
                          );
                        }

                        return (
                          <>
                            {matchedItems.map((skill, i) => (
                              <div
                                key={`match-${skill}`}
                                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-slate-100 px-4 py-2.5 text-xs last:border-0 hover:bg-slate-50/50 dark:border-slate-800/80 dark:hover:bg-slate-900/30"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <span className="truncate font-semibold capitalize text-slate-900 dark:text-white">
                                    {skill}
                                  </span>
                                </div>
                                <span className="w-24 text-center">
                                  <Badge variant="success" className="text-[10px]">
                                    Matched
                                  </Badge>
                                </span>
                                <span className="w-32 text-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                  ✓ In resume
                                </span>
                              </div>
                            ))}

                            {missingItems.map((skill, i) => (
                              <div
                                key={`miss-${skill}`}
                                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-slate-100 bg-amber-50/15 px-4 py-2.5 text-xs last:border-0 hover:bg-amber-50/30 dark:border-slate-800/80 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">+</span>
                                  </div>
                                  <span className="truncate font-semibold capitalize text-slate-900 dark:text-white">
                                    {skill}
                                  </span>
                                </div>
                                <span className="w-24 text-center">
                                  <Badge variant="warning" className="text-[10px]">
                                    Skill Gap
                                  </Badge>
                                </span>
                                <span className="w-32 text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                  ⚡ Target to add
                                </span>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Chart & Priority Recommendations */}
            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <JobMatchBarChart
                  skillMatch={matchResult.skillMatch}
                  experienceMatch={matchResult.experienceMatch}
                  educationMatch={matchResult.educationMatch}
                  overallScore={matchResult.overallScore}
                />
              </div>

              {/* Priority Actions */}
              <div className="saas-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Target Job Action Queue</h3>
                    <p className="text-xs text-slate-500">Highest leverage steps to close gap with this job</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {matchResult.missingKeywords.length > 0 && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/30 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                          Target Core Keywords
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300">
                          Weave into bullet points: {matchResult.missingKeywords.slice(0, 4).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {matchResult.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/40 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
                    >
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                      <p className="leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Pipeline Acceleration Banner */}
            <div className="saas-card overflow-hidden p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="tech-badge border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                    Next Application Steps
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                    Apply With Targeted Materials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Propagate these verified match parameters into your cover letter and interview strategy
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to="/cover-letter">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      Generate Cover Letter
                    </Button>
                  </Link>
                  <Link to="/interview-prep">
                    <Button size="sm" className="gap-1.5 text-xs shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Prepare Targeted Interview
                    </Button>
                  </Link>
                  {selectedResumeId && (
                    <Link to={`/resume-analysis?resumeId=${selectedResumeId}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        Review ATS Analysis
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty / Initial State */
          <div className="saas-card p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ready to Analyze Match
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              Paste a target job description or provide a job URL above. We will compare requirements with your resume to
              identify instant advantages and skill gaps.
            </p>
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Instant Alignment</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Calculates exact skill coverage % and weighted recruiter ATS fit.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Gaps to Bridge</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Uncovers high-yield keywords to incorporate before submitting.
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
