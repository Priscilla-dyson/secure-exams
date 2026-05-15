"use client";

import { useState } from "react";
import {
  Award,
  Hourglass,
  EyeOff,
  XCircle,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Tab = "released" | "pending" | "hidden" | "missed";

const RELEASED = [
  {
    module: "Software Engineering",
    type: "Mid Semester",
    date: "Jan 8, 2025",
    score: 84,
    max: 100,
    grade: "A",
    feedback:
      "Strong analysis on architectural patterns. Improve discussion of trade-offs in CI/CD.",
  },
  {
    module: "Discrete Math",
    type: "Quiz",
    date: "Jan 5, 2025",
    score: 18,
    max: 20,
    grade: "A",
    feedback: "Excellent — minor slip on induction proof in Q4.",
  },
  {
    module: "Data Structures",
    type: "End Semester",
    date: "Dec 28, 2024",
    score: 67,
    max: 100,
    grade: "B",
    feedback: "Good complexity analysis. Tree balancing question needed more depth.",
  },
];

export default function StudentResults() {
  const [tab, setTab] = useState<Tab>("released");

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Award} label="Released" value={3} />
        <Stat icon={Hourglass} label="Pending" value={2} accent="warning" />
        <Stat icon={EyeOff} label="Hidden" value={1} />
        <Stat icon={XCircle} label="Missed" value={1} accent="destructive" />
      </section>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex gap-6">
            {(["released", "pending", "hidden", "missed"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "border-b-2 pb-3 text-sm font-semibold capitalize transition " +
                  (tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {tab === "released" && <ReleasedList />}
        {tab === "pending" && (
          <Empty
            icon={Hourglass}
            title="2 results awaiting review"
            text="Your lecturer is finalising grades for these exams."
          />
        )}
        {tab === "hidden" && (
          <Empty
            icon={EyeOff}
            title="Result hidden by faculty"
            text="This result has been withheld pending administrative review."
          />
        )}
        {tab === "missed" && (
          <Empty
            icon={XCircle}
            title="1 missed exam"
            text="Linear Algebra · Dec 12 — submit a review request from Help & Support."
          />
        )}
    </div>
  );
}

function ReleasedList() {
  const [open, setOpen] = useState<string | null>(RELEASED[0].module);
  return (
    <div className="space-y-3">
      {RELEASED.map((r) => {
        const pct = Math.round((r.score / r.max) * 100);
        const isOpen = open === r.module;
        return (
          <div
            key={r.module}
            className="rounded-md border border-border bg-card"
          >
            <button
              onClick={() => setOpen(isOpen ? null : r.module)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {r.module}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.type} · {r.date}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-base font-bold text-foreground">
                    {r.score}
                    <span className="text-muted-foreground">/{r.max}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{pct}%</p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                  {r.grade}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-4">
                <div className="mb-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Lecturer feedback
                </p>
                <p className="mt-1 text-sm text-foreground">{r.feedback}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    <Download className="h-3.5 w-3.5" /> Download statement
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    <TrendingUp className="h-3.5 w-3.5" /> Compare with cohort
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Award;
  label: string;
  value: number;
  accent?: "warning" | "destructive";
}) {
  const tone =
    accent === "warning"
      ? "text-[color:var(--warning)] bg-[color:var(--warning)]/10"
      : accent === "destructive"
      ? "text-destructive bg-destructive/10"
      : "text-primary bg-primary/10";
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <span className={"flex h-8 w-8 items-center justify-center rounded-md " + tone}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Empty({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Hourglass;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}