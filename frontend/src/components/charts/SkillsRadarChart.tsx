import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RechartsSafeContainer } from "@/components/charts/RechartsSafeContainer";

function clampScore(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

interface SkillsRadarChartProps {
  skills: number;
  experience: number;
  education: number;
  projects: number;
  /** Headline ATS from `resume.atsScore` — fifth axis so the chart aligns with the main score card */
  headlineAts?: number | null;
  /** "card" wraps in standard Card; "bare" renders just the chart container */
  variant?: "card" | "bare";
}

export function SkillsRadarChart({
  skills,
  experience,
  education,
  projects,
  headlineAts,
  variant = "card",
}: SkillsRadarChartProps) {
  const s = clampScore(skills);
  const e = clampScore(experience);
  const ed = clampScore(education);
  const p = clampScore(projects);
  const ats = headlineAts != null && headlineAts !== undefined ? clampScore(headlineAts) : null;

  const data = [
    { subject: "Skills", score: s, fullMark: 100 },
    { subject: "Experience", score: e, fullMark: 100 },
    { subject: "Education", score: ed, fullMark: 100 },
    { subject: "Projects", score: p, fullMark: 100 },
    ...(ats != null && ats > 0 ? [{ subject: "ATS (overall)", score: ats, fullMark: 100 }] : []),
  ];

  const chartElement = (
    <RechartsSafeContainer empty={false}>
      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={240}>
        <RadarChart
          cx="50%"
          cy="51%"
          outerRadius="62%"
          margin={{ top: 28, right: 36, bottom: 28, left: 36 }}
          data={data}
        >
          <defs>
            <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="radarArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.12} />
            </linearGradient>
          </defs>
          <PolarGrid
            stroke="#64748b"
            strokeOpacity={0.25}
            radialLines={false}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
            tickLine={false}
            tickMargin={14}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickCount={5}
            tick={{ fill: "#64748b", fontSize: 9 }}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Score"]}
            contentStyle={{
              background: "rgba(15, 23, 42, 0.94)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: 12,
              fontSize: 12,
              color: "#e2e8f0",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
            }}
            labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
          />
          <Radar
            name="Section score"
            dataKey="score"
            stroke="url(#radarStroke)"
            fill="url(#radarArea)"
            fillOpacity={1}
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#818cf8", stroke: "#4f46e5", strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: "#c084fc", stroke: "#7c3aed", strokeWidth: 2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </RechartsSafeContainer>
  );

  if (variant === "bare") {
    return chartElement;
  }

  return (
    <Card className="saas-card overflow-hidden">
      <CardHeader>
        <CardTitle>Resume Section Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {chartElement}
      </CardContent>
    </Card>
  );
}
