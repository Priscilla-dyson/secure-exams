'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Award,
  Hourglass,
  EyeOff,
  XCircle,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info
} from 'lucide-react'

type Tab = "released" | "pending" | "hidden" | "missed";

const RELEASED: any[] = []

export default function StudentResults() {
  const [tab, setTab] = useState<Tab>("released");

  const releasedCount = 0
  const pendingCount = 0
  const hiddenCount = 0
  const missedCount = 0

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Award} label="Released" value={releasedCount} />
        <Stat icon={Hourglass} label="Pending" value={pendingCount} accent="warning" />
        <Stat icon={EyeOff} label="Hidden" value={hiddenCount} />
        <Stat icon={XCircle} label="Missed" value={missedCount} accent="destructive" />
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

        {/* Tab Content */}
        {tab === "released" && <ReleasedList />}
        {tab === "pending" && (
          <div className="text-center py-12 border border-border rounded-md bg-card">
            <Hourglass className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No pending results</p>
          </div>
        )}
        {tab === "hidden" && (
          <div className="text-center py-12 border border-border rounded-md bg-card">
            <EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No hidden results</p>
          </div>
        )}
        {tab === "missed" && (
          <div className="text-center py-12 border border-border rounded-md bg-card">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No missed exams</p>
          </div>
        )}
    </div>
  );
}

function ReleasedList() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {RELEASED.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No released results available</p>
        </div>
      ) : (
        RELEASED.map((r) => {
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
                <div className="mb-4 rounded-md bg-muted/50 p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Feedback</p>
                  <p className="text-sm text-muted-foreground">{r.feedback}</p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                    <Download className="h-3.5 w-3.5" /> Download Report
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    <TrendingUp className="h-3.5 w-3.5" /> Compare with cohort
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })
      )}
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
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
