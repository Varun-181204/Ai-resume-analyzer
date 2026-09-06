import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileSearch,
  Briefcase,
  Clock,
  Layers,
  Wand2,
  Target,
  Mic,
  Check,
  Zap,
  X,
  ShieldCheck,
  ChevronRight,
  Play,
  HelpCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AtsScoreChart } from "@/components/charts/AtsScoreChart";
import { SkillsRadarChart } from "@/components/charts/SkillsRadarChart";
import { useAuth } from "@/hooks/useAuth";
import { resumeApi } from "@/api/resume";
import type { Resume, Analysis } from "@/types";
import { getScoreLabel } from "@/utils/constants";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { CareerWorkflowBar } from "@/components/dashboard/CareerWorkflowBar";
import { AiCopilotPanel } from "@/components/dashboard/AiCopilotPanel";
import { ResumeHealthMatrix } from "@/components/resume/ResumeHealthMatrix";
import { SAMPLE_RESUMES, type SampleResume } from "@/data/sampleResumes";
import { cn } from "@/utils/cn";

function resumeRecencyMs(r: Resume): number {
  const analysisT = r.analysis?.updatedAt ? new Date(r.analysis.updatedAt).getTime() : 0;
  const resumeT = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
  const created = new Date(r.createdAt).getTime();
  return Math.max(analysisT, resumeT, created);
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewSample, setPreviewSample] = useState<SampleResume | null>(null);

  // Quick Dashboard Dropzone Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("");

  const loadResumes = useCallback(() => {
    return resumeApi
      .getHistory()
      .then((data) => {
        setResumes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("[Dashboard] Failed to load resumes:", err);
      });
  }, []);

  useEffect(() => {
    loadResumes().finally(() => {
      setIsLoading(false);
    });
  }, [loadResumes]);

  // Handle direct file drop on the dashboard
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file format", {
          description: "Please upload a PDF or DOCX file.",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File exceeds limit", {
          description: "Maximum file size is 5MB.",
        });
        return;
      }

      setIsUploading(true);
      setUploadStage("Uploading document...");

      const formData = new FormData();
      formData.append("resume", file);

      try {
        setUploadStage("Extracting text and structure...");
        const newResume = await resumeApi.upload(formData);

        setUploadStage("Analyzing ATS keywords & scoring...");
        toast.success("Resume uploaded successfully! ✨", {
          description: "Analyzing your resume now...",
        });

        await loadResumes();
        setPreviewSample(null);

        // Auto-navigate to the intelligence report
        navigate(`/analysis?resumeId=${newResume.id}`);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadStage("");
      }
    },
    [loadResumes, navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: isUploading,
  });

  const safeResumes = Array.isArray(resumes) ? resumes : [];
  const sortedResumes = useMemo(
    () => [...safeResumes].sort((a, b) => resumeRecencyMs(b) - resumeRecencyMs(a)),
    [safeResumes]
  );

  // Active resume calculation: If user clicked a sample demo, wrap sample into Resume shape for preview
  const sampleAsResume: Resume | null = previewSample
    ? {
        id: previewSample.id,
        userId: "demo",
        fileName: previewSample.fileName,
        fileUrl: "",
        atsScore: previewSample.atsScore,
        createdAt: new Date().toISOString(),
        analysis: previewSample.analysis,
      }
    : null;

  const latestResume = sampleAsResume || sortedResumes[0];
  const analysis = latestResume?.analysis;
  const canonicalAts = Math.round(Number(latestResume?.atsScore ?? 0));

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name ? user.name.split(" ")[0] : "Candidate";

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO WORKSPACE: Contextual Greeting + Instant Dropzone / Centerpiece */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="saas-card relative overflow-hidden p-6 lg:p-7"
      >
        {/* Background ambient lighting */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Contextual Briefing */}
          <div className="max-w-2xl">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="status-pulse">
                <span className="status-pulse-ping" />
                <span className="status-pulse-dot" />
              </span>
              <span className="tech-badge border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                AI Career Cockpit Active
              </span>
              {previewSample && (
                <span className="tech-badge border-brand-200 bg-brand-50/80 text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                  ✨ Interactive Demo Mode
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {greeting}, {firstName}
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
              {latestResume
                ? canonicalAts >= 80
                  ? `Your active resume "${latestResume.fileName}" is scoring at an elite ${canonicalAts}% ATS readiness index. Next step: compare against specific job postings to ensure 100% keyword alignment.`
                  : canonicalAts >= 60
                  ? `Your resume "${latestResume.fileName}" achieved ${canonicalAts}% ATS compatibility. The AI Copilot has surfaced key bullet point and impact suggestions below.`
                  : `Your resume "${latestResume.fileName}" scored ${canonicalAts}%. We recommend running an AI rewrite pass to bypass recruiter keyword screening.`
                : "Welcome to your AI Career Command Center. Upload your resume or try an instant interactive sample to inspect multi-dimensional ATS scoring, skill gaps, and interview prep."}
            </p>

            {/* Quick Context Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                <span>
                  {safeResumes.length} {safeResumes.length === 1 ? "Resume" : "Resumes"} Stored
                </span>
              </div>
              {previewSample ? (
                <button
                  onClick={() => setPreviewSample(null)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                >
                  <X className="h-3 w-3" />
                  Exit Demo View
                </button>
              ) : (
                latestResume && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Updated: {new Date(latestResume.updatedAt || latestResume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right: ATS Readiness Centerpiece OR Instant Dropzone */}
          {latestResume ? (
            <div className="flex shrink-0 items-center justify-center lg:justify-end">
              <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white/90 p-4.5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/90 sm:flex-row sm:gap-6">
                <div className="h-28 w-28 shrink-0">
                  <AtsScoreChart score={canonicalAts} variant="gauge" size={112} />
                </div>
                <div className="mt-2 text-center sm:mt-0 sm:text-left">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ATS Readiness Index
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5 sm:justify-start">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{canonicalAts}</span>
                    <span className="text-xs font-medium text-slate-400">/100</span>
                  </div>
                  <Badge
                    variant={canonicalAts >= 75 ? "success" : canonicalAts >= 50 ? "warning" : "danger"}
                    className="mt-1 text-[10px]"
                  >
                    {getScoreLabel(canonicalAts)}
                  </Badge>
                  <div className="mt-2.5">
                    <Link to={previewSample ? `/analysis?resumeId=${previewSample.id}&sample=true` : `/analysis?resumeId=${latestResume.id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        View Report &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Instant Dropzone Card when 0 resumes */
            <div className="w-full max-w-md shrink-0">
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300",
                  isDragActive
                    ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.25)]"
                    : "border-indigo-300/60 bg-gradient-to-b from-indigo-500/[0.03] via-white/80 to-purple-500/[0.03] hover:border-indigo-500/80 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] dark:border-indigo-500/30 dark:from-indigo-950/20 dark:via-slate-900/70 dark:to-purple-950/10 dark:hover:border-indigo-400/60"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                  {isDragActive ? "Drop your resume to analyze immediately" : "Drag & drop resume here, or browse"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">Supports PDF & DOCX up to 5MB</p>
                {isUploading && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500" />
                    <span>{uploadStage}</span>
                  </div>
                )}
              </div>

              {/* 1-Click Interactive Demo Resumes */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Instant Demo:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_RESUMES.slice(0, 2).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setPreviewSample(s);
                        toast.success(`Loaded demo resume: ${s.name} (${s.role})`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/90 bg-indigo-50/70 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 shadow-2xs transition-all hover:scale-105 hover:border-indigo-400 hover:bg-indigo-100/90 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:border-indigo-500"
                    >
                      <Play className="h-2.5 w-2.5 text-indigo-500 fill-indigo-500" />
                      {s.role} ({s.atsScore}%)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. CAREER PROGRESS WORKFLOW PIPELINE */}
      {/* ========================================================================= */}
      <CareerWorkflowBar activeResume={latestResume} currentStage={latestResume ? 2 : 1} resumeId={latestResume?.id} />

      {/* ========================================================================= */}
      {/* 3. TEAL-STYLE CAREER LAUNCHPAD CHECKLIST */}
      {/* ========================================================================= */}
      <div className="saas-card relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Career Launch Checklist</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Essential milestones to ensure high recruiter callbacks and bypass ATS filters
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {latestResume ? "2 of 4 Completed (50%)" : "1 of 4 Completed (25%)"}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: latestResume ? "50%" : "25%" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/30 p-3 dark:border-emerald-500/20 dark:bg-emerald-950/25">
            <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <Check className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">01. Account Setup</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Profile & workspace active</p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={cn(
              "flex items-start gap-2.5 rounded-xl border p-3 transition-colors",
              latestResume
                ? "border-emerald-500/30 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-950/25"
                : "border-indigo-500/30 bg-indigo-50/30 dark:border-indigo-500/20 dark:bg-indigo-950/25"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-white shadow-xs",
                latestResume ? "bg-emerald-500" : "bg-indigo-600 dark:bg-indigo-500"
              )}
            >
              {latestResume ? <Check className="h-3 w-3" /> : <span className="text-[10px] font-bold">2</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">02. Scan Target Resume</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {latestResume ? `Scored (${canonicalAts}% ATS)` : "Upload or try demo"}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <Link
            to={latestResume ? `/job-match?resumeId=${latestResume.id}` : "/job-match"}
            className="group flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50/20 p-3 transition-all hover:border-amber-400 hover:bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-950/20 dark:hover:border-amber-400/40 dark:hover:bg-amber-950/30"
          >
            <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
              <span className="text-[10px] font-bold">3</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                03. Match Target Job
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">Compare with job description &rarr;</p>
            </div>
          </Link>

          {/* Step 4 */}
          <Link
            to="/interview-prep"
            className="group flex items-start gap-2.5 rounded-xl border border-purple-500/30 bg-purple-50/20 p-3 transition-all hover:border-purple-400 hover:bg-purple-50/40 dark:border-purple-500/20 dark:bg-purple-950/20 dark:hover:border-purple-400/40 dark:hover:bg-purple-950/30"
          >
            <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white shadow-xs">
              <span className="text-[10px] font-bold">4</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                04. Prepare Interview
              </p>
              <p className="text-[10px] text-purple-700 dark:text-purple-400">Generate targeted Q&A &rarr;</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 4 CORE AI POWER TOOLS GRID (Rich Luminous Colors) */}
      {/* ========================================================================= */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Core AI Career Tools</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specialized intelligence modules for every stage of your job hunt
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tool 1: ATS Audit */}
          <Link
            to={latestResume ? `/analysis?resumeId=${latestResume.id}` : "/upload"}
            className="saas-card group relative overflow-hidden p-5 transition-all hover:border-indigo-400 hover:shadow-[0_8px_30px_rgba(99,102,241,0.18)] dark:hover:border-indigo-500/60"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25">
                  <FileSearch className="h-5 w-5" />
                </div>
                <span className="rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300">
                  98% Accuracy
                </span>
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                Deep ATS Audit
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Multi-dimensional evaluation of formatting, impact metrics, and recruiter keyword density.
              </p>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <span>Run Audit</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Tool 2: Job Match */}
          <Link
            to={latestResume ? `/job-match?resumeId=${latestResume.id}` : "/job-match"}
            className="saas-card group relative overflow-hidden p-5 transition-all hover:border-emerald-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.18)] dark:hover:border-emerald-500/60"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25">
                  <Target className="h-5 w-5" />
                </div>
                <span className="rounded-md border border-emerald-200 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Live URL Support
                </span>
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                Target Job Matcher
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Compare your qualifications side-by-side with any job description to isolate skill gaps.
              </p>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>Match Job</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Tool 3: AI Bullet Rewriter */}
          <Link
            to="/analysis"
            className="saas-card group relative overflow-hidden p-5 transition-all hover:border-amber-400 hover:shadow-[0_8px_30px_rgba(245,158,11,0.18)] dark:hover:border-amber-500/60"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25">
                  <Wand2 className="h-5 w-5" />
                </div>
                <span className="rounded-md border border-amber-200 bg-amber-50/80 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
                  Action Verbs
                </span>
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                AI Bullet Rewriter
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Transform passive, weak duty descriptions into quantified, high-impact achievement statements.
              </p>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <span>Rewrite Bullets</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Tool 4: Interview Simulator */}
          <Link
            to="/interview-prep"
            className="saas-card group relative overflow-hidden p-5 transition-all hover:border-purple-400 hover:shadow-[0_8px_30px_rgba(168,85,247,0.18)] dark:hover:border-purple-500/60"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25">
                  <Mic className="h-5 w-5" />
                </div>
                <span className="rounded-md border border-purple-200 bg-purple-50/80 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300">
                  Custom Q&A
                </span>
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                Interview Simulator
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Generate custom technical and behavioral interview scenarios tailored to your background.
              </p>
              <div className="mt-3.5 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                <span>Practice Now</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN COMMAND CENTER GRID: Active Intelligence Workspace */}
      {/* ========================================================================= */}
      {latestResume && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Active Resume Workspace Card */}
            <div className="saas-card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{latestResume.fileName}</h3>
                      <span className="tech-badge">{latestResume.fileType || "PDF"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Active Evaluation Profile &bull; {canonicalAts}% Recruiter Pass Probability
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link to={previewSample ? `/analysis?resumeId=${previewSample.id}&sample=true` : `/analysis?resumeId=${latestResume.id}`}>
                    <Button size="sm" className="gap-1.5 text-xs shadow-sm">
                      <FileSearch className="h-3.5 w-3.5" />
                      Full Report
                    </Button>
                  </Link>
                  <Link to={`/job-match?resumeId=${latestResume.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Briefcase className="h-3.5 w-3.5" />
                      Match Job
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Resume Health Matrix */}
            {analysis && <ResumeHealthMatrix analysis={analysis} atsScore={canonicalAts} />}

            {/* Skills Intelligence Map */}
            {analysis && (
              <div className="saas-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills Intelligence Map</h3>
                    <p className="text-[11px] text-slate-500">
                      Verified competencies vs high-value keyword opportunities
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {analysis.keywords.length} Found
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      {analysis.missingKeywords.length} Gaps
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Verified Competencies ({analysis.keywords.length})
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {analysis.keywords.slice(0, 14).map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 text-[11px] font-medium text-emerald-800 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                        >
                          {kw}
                        </span>
                      ))}
                      {analysis.keywords.length > 14 && (
                        <span className="inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-100/60 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                          +{analysis.keywords.length - 14} more
                        </span>
                      )}
                    </div>
                  </div>

                  {analysis.missingKeywords.length > 0 && (
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        High-Yield Opportunities ({analysis.missingKeywords.length})
                      </span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {analysis.missingKeywords.slice(0, 8).map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-2xs transition-all hover:border-amber-500/50 hover:bg-amber-500/15 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resume Version History */}
            <div className="saas-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resume Versions</h3>
                <Link to="/history" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  View All Scans &rarr;
                </Link>
              </div>

              {safeResumes.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Currently viewing sample demo resume. Upload your real resume above to start tracking versions.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {safeResumes.slice(0, 3).map((r) => {
                    const rScore = Math.round(Number(r.atsScore ?? 0));
                    return (
                      <Link
                        key={r.id}
                        to={`/analysis?resumeId=${r.id}`}
                        className="group flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-all hover:border-brand-300 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:border-brand-500/30 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-500" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{r.fileName}</p>
                            <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="tech-badge">{rScore}% ATS</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* AI Career Copilot Panel */}
            <AiCopilotPanel resume={latestResume} analysis={analysis} />

            {/* Multi-Dimensional Radar Chart */}
            {analysis && (
              <div className="saas-card p-5">
                <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Dimensional Competency Radar
                </h3>
                <p className="mb-4 text-[11px] text-slate-500">
                  Balanced scoring across skills, experience, education, and projects
                </p>
                <div className="min-w-0">
                  <SkillsRadarChart
                    skills={analysis.skillsScore}
                    experience={analysis.experienceScore}
                    education={analysis.educationScore}
                    projects={analysis.projectsScore}
                    headlineAts={canonicalAts}
                    variant="bare"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
