import { motion } from "framer-motion";
import { getScoreColor, getScoreLabel } from "@/utils/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface AtsScoreChartProps {
  score: number;
  /** Explains what the number represents (e.g. latest analyzed resume vs portfolio). */
  caption?: string;
  /** "card" wraps in a SaaS Card; "gauge" renders an unadorned, responsive circular gauge */
  variant?: "card" | "gauge";
  size?: number;
  className?: string;
}

export function AtsScoreChart({
  score,
  caption = "Most recently analyzed resume",
  variant = "card",
  size,
  className,
}: AtsScoreChartProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // Gradient ID & colors based on score tiers
  const gradientId =
    score >= 75 ? "atsGradGreen" : score >= 50 ? "atsGradAmber" : "atsGradRose";
  const glowColor =
    score >= 75
      ? "rgba(16, 185, 129, 0.4)"
      : score >= 50
      ? "rgba(245, 158, 11, 0.4)"
      : "rgba(244, 63, 94, 0.4)";

  // SVG Geometry (Radius 64, circumference ~402)
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const svgGauge = (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={size ? { width: size, height: size } : { width: "100%", height: "100%" }}
    >
      {/* Ambient background glow behind the gauge */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-700"
        style={{ backgroundColor: color }}
      />

      <svg
        viewBox="0 0 160 160"
        className="w-full h-full -rotate-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
      >
        <defs>
          <linearGradient id="atsGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="atsGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="atsGradRose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={glowColor} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200/90 dark:text-slate-800/80"
        />

        {/* Dynamic Animated Progress Arc */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#gaugeGlow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      {/* Center Label & Number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <motion.span
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 180 }}
        >
          {score}%
        </motion.span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          ATS
        </span>
      </div>
    </div>
  );

  if (variant === "gauge") {
    return svgGauge;
  }

  return (
    <Card className={cn("saas-card overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gradient">ATS Readiness</CardTitle>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Index
          </span>
        </div>
        <CardDescription className="text-xs">{caption}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col items-center">
          <div className="h-44 w-44">{svgGauge}</div>
          <motion.div
            className="mt-3 flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span
              className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: color, color }}
            />
            <span className="text-sm font-bold" style={{ color }}>
              {label}
            </span>
          </motion.div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Recruiter pass probability score
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
