import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Send, User, Upload, Sparkles, FileText, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resumeApi } from "@/api/resume";
import type { Resume, ChatHistoryTurn } from "@/types";
import { cn } from "@/utils/cn";

interface Message {
  role: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  { text: "How can I improve my experience bullet points?", icon: Zap },
  { text: "What high-yield technical skills am I missing?", icon: Sparkles },
  { text: "How can I optimize this resume for modern ATS algorithms?", icon: CheckCircle2 },
  { text: "How can I quantify achievements in my projects section?", icon: ArrowRight },
  { text: "Draft a concise 3-sentence professional summary", icon: FileText },
];

export function AiChatPage() {
  const [searchParams] = useSearchParams();
  const paramResumeId = searchParams.get("resumeId") || searchParams.get("id");

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! 👋 I'm your AI Career Copilot. Ask me anything about your resume — how to strengthen weak bullet points, increase ATS pass rates, tailor for specific roles, or prepare for technical interviews.\n\nSelect your active resume above and ask away!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInit, setIsInit] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      .finally(() => setIsInit(false));
  }, [paramResumeId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || !selectedResumeId) return;
    setInput("");
    const historyForApi: ChatHistoryTurn[] = messages.slice(1).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setIsLoading(true);
    try {
      const res = await resumeApi.chat(selectedResumeId, q, historyForApi);
      setMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I ran into an issue analyzing that. Please try again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInit) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Bot className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
        <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">No Resumes Found</h2>
        <p className="mb-6 text-xs text-slate-500">Upload a resume to chat with your AI Career Copilot</p>
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
    <div className="flex min-h-0 flex-1 flex-col space-y-4">
      {/* Header Context Bar */}
      <div className="saas-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="tech-badge border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300">
                <Sparkles className="mr-1 h-3 w-3 text-brand-500" />
                AI Career Copilot
              </span>
              <span className="tech-badge border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Gemini 2.5 Flash
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interactive Resume Copilot
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="flex h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fileName} (ATS: {r.atsScore ?? "--"}%)
                </option>
              ))}
            </select>
            {activeResume?.atsScore != null && (
              <span className="tech-badge border border-slate-200 bg-slate-100 font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                ATS: {activeResume.atsScore}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="saas-card flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Messages Stream */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 pb-28 max-md:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full min-w-0 gap-2.5 sm:gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl text-xs ${
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-2xs"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              >
                {msg.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
              </div>
              <div className={`min-w-0 flex-1 ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
                <div
                  className={`max-w-[92%] min-w-0 break-words rounded-2xl px-4 py-3 text-xs leading-relaxed sm:max-w-[80%] ${
                    msg.role === "ai"
                      ? "border border-slate-200/80 bg-slate-50/80 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                      : "bg-brand-600 text-white shadow-xs"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.text.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : <span key={j}>{part}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex w-full min-w-0 gap-2.5 sm:gap-3.5">
              <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-block rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: "300ms" }} />
                    <span className="ml-1 text-[11px] text-slate-400">Copilot is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />

          {/* Quick suggestions */}
          {messages.length <= 2 && (
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="mb-2 text-[11px] font-semibold text-slate-400">Suggested questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => handleSend(s.text)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs text-slate-700 transition-all hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-600"
                  >
                    <s.icon className="h-3 w-3 text-brand-500 shrink-0" />
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Composer */}
        <div
          className="shrink-0 border-t border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/90 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-20 max-md:bg-white/90 max-md:backdrop-blur-md max-md:dark:bg-slate-950/90 md:static"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mx-auto flex max-w-full gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your resume, bullet points, or role tailoring..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 rounded-xl text-xs shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
