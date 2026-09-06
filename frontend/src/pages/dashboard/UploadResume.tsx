import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import ReactGA from "react-ga4";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Briefcase,
  GitCompareArrows,
  ArrowRight,
  Clock,
  Plus,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resumeApi } from "@/api/resume";
import type { Resume } from "@/types";
import { SAMPLE_RESUMES, type SampleResume } from "@/data/sampleResumes";
import { ResumeHealthMatrix } from "@/components/resume/ResumeHealthMatrix";
import { cn } from "@/utils/cn";

export function UploadResumePage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState("Extracting resume text...");
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [isUploadMode, setIsUploadMode] = useState(false);

  // Load user resumes
  useEffect(() => {
    resumeApi
      .getHistory()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResume(list[0]);
        } else {
          setIsUploadMode(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSample = (sample: SampleResume) => {
    if (loadingSample) return;

    ReactGA.event({
      category: "Resume Features",
      action: "View_Sample_CV",
      label: `Sample: ${sample.name}`,
    });

    setLoadingSample(sample.id);
    toast.loading(`Loading ${sample.name}'s analysis...`, { id: "sample" });

    setTimeout(() => {
      setLoadingSample(null);
      toast.success("Viewing sample analysis!", { id: "sample", duration: 5000 });
      navigate(`/analysis?resumeId=${sample.id}&sample=true`, {
        state: { sampleData: sample },
      });
    }, 2000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError("");
    setUploadProgress(0);
    const selectedFile = acceptedFiles[0];

    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError("Only PDF and DOCX files are accepted. Please select a valid document.");
        toast.error("Invalid file type", {
          description: "Please upload a PDF or DOCX file",
        });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError("File size exceeds 5MB limit. Please compress or upload a smaller file.");
        toast.error("File too large", {
          description: "Maximum file size is 5MB",
        });
        return;
      }
      setFile(selectedFile);
      toast.success("File selected!", {
        description: selectedFile.name,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;

    ReactGA.event({
      category: "Resume Features",
      action: "Upload_Personal_CV",
      label: `File Type: ${file.type}`,
    });

    setIsUploading(true);
    setUploadError("");

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const resume = await resumeApi.upload(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);

      toast.success("Resume uploaded successfully!", {
        description: "Starting AI analysis...",
      });

      setIsAnalyzing(true);
      setAnalysisStage("Extracting resume text...");

      const stages = [
        "Extracting resume text...",
        "Analyzing sections & structure...",
        "Running NLP keyword detection...",
        "Calculating ATS compatibility score...",
        "Generating actionable recommendations...",
      ];
      let sIdx = 0;
      const stageTimer = setInterval(() => {
        sIdx = (sIdx + 1) % stages.length;
        setAnalysisStage(stages[sIdx]);
      }, 1500);

      try {
        await resumeApi.analyze(resume.id);
        clearInterval(stageTimer);
        toast.success("Analysis complete!", {
          description: "Opening Resume Intelligence Workspace...",
        });
        navigate(`/analysis?id=${resume.id}`);
      } catch {
        clearInterval(stageTimer);
        toast.info("Uploaded successfully! Opening analysis view...", {
          description: "You can trigger full analysis from the workspace.",
        });
        navigate(`/analysis?id=${resume.id}`);
      }
    } catch {
      clearInterval(progressInterval);
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadError("Failed to upload resume. Please check your document and try again.");
      toast.error("Upload failed");
    }
  };

  const currentAts = Math.round(Number(selectedResume?.atsScore ?? 0));

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="tech-badge">Workspace</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resume Studio
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage resume versions, inspect document health, and upload candidate documents
          </p>
        </div>

        <Button
          onClick={() => {
            setIsUploadMode(true);
            setFile(null);
          }}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Upload New Resume
        </Button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Resume Versions & Documents Rail (4 cols) */}
        {/* ========================================================================= */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/60 dark:backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Uploaded Versions ({resumes.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsUploadMode(true);
                  setFile(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                + Add
              </button>
            </div>

            {resumes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No resumes uploaded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map((r) => {
                  const isSelected = selectedResume?.id === r.id && !isUploadMode;
                  const rScore = Math.round(Number(r.atsScore ?? 0));
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedResume(r);
                        setIsUploadMode(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/40"
                          : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {r.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <span className="tech-badge shrink-0">{rScore}%</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 text-xs text-slate-600 dark:border-slate-800/90 dark:bg-slate-900/30 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              💡 Studio Tip:
            </p>
            <p className="mt-1 leading-relaxed">
              Export text-based PDFs directly from Google Docs or Word. Avoid scanned image PDFs so the NLP engine can extract full text cleanly.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER / MAIN WORKSPACE COLUMN (8 cols) */}
        {/* ========================================================================= */}
        <div className="space-y-6 lg:col-span-8">
          {/* Upload Mode OR Inspect Selected Resume */}
          {isUploadMode || !selectedResume ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/60 dark:backdrop-blur-xl">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Your Resume
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag and drop your document to trigger ATS scoring, keyword mapping, and recommendations
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60 dark:border-slate-700 dark:hover:bg-slate-800/30"
                )}
              >
                <input {...getInputProps()} />

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Upload className="h-6 w-6" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isDragActive ? "Drop your resume here" : "Choose a file or drag & drop"}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Supported formats: PDF, DOCX (up to 5MB)
                </p>

                {/* Badges */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="tech-badge">PDF</span>
                  <span className="tech-badge">DOCX</span>
                  <span className="tech-badge">Max 5MB</span>
                </div>
              </div>

              {/* Selected File Preview & Upload Trigger */}
              {file && (
                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpload}
                      isLoading={isUploading || isAnalyzing}
                      disabled={isUploading || isAnalyzing}
                      className="gap-2 shadow-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      Analyze Document
                    </Button>
                  </div>

                  {/* Multi-Stage Visual Processing Timeline */}
                  {(isUploading || isAnalyzing) && (
                    <div className="mt-4 space-y-2 border-t border-indigo-200/60 pt-3 dark:border-indigo-900/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-indigo-700 dark:text-indigo-300">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {isUploading ? `Uploading document (${uploadProgress}%)...` : analysisStage}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${isUploading ? uploadProgress : 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Selected Resume Inspector */
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/60 dark:backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {selectedResume.fileName}
                        </h3>
                        <span className="tech-badge">{selectedResume.fileType || "PDF"}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Uploaded on {new Date(selectedResume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                      {currentAts}%
                    </span>
                    <Badge variant={currentAts >= 75 ? "success" : currentAts >= 50 ? "warning" : "danger"}>
                      {currentAts >= 75 ? "Strong" : currentAts >= 50 ? "Moderate" : "Needs Review"}
                    </Badge>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Button
                    onClick={() => navigate(`/analysis?id=${selectedResume.id}`)}
                    className="gap-1.5 shadow-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Open Intelligence Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/job-match")}
                    className="gap-1.5"
                  >
                    <Briefcase className="h-4 w-4" />
                    Match with Job
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/compare")}
                    className="gap-1.5"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare
                  </Button>
                </div>
              </div>

              {/* Health Matrix of Selected Resume */}
              {selectedResume.analysis && (
                <ResumeHealthMatrix analysis={selectedResume.analysis} />
              )}
            </div>
          )}

          {/* Sample Resumes Section */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/60 dark:backdrop-blur-xl">
            <div className="mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Quick Test with Sample Resumes
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Explore real ATS intelligence metrics instantly without uploading
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {SAMPLE_RESUMES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSample(sample)}
                  disabled={loadingSample !== null}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-left transition-all hover:border-indigo-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-500/40"
                >
                  <div className="mb-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {sample.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {sample.role}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="tech-badge">{sample.atsScore}% ATS</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Test &rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}