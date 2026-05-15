"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
  PenLine,
  FileCheck2,
  X,
  Calendar,
  Maximize2,
  Wifi,
  Mic,
} from "lucide-react";
import React from "react";

type Stage = "readiness" | "active" | "submitted";
type QType = "mcq" | "short" | "essay" | "math";

interface Question {
  id: string;
  type: QType;
  prompt: string;
  marks: number;
  options?: string[];
}

// Sample questions for Operating Systems exam
const QUESTIONS: Record<string, Question[]> = {
  "os-mid": [
    {
      id: "q1",
      type: "mcq",
      prompt: "Which scheduling algorithm minimizes average waiting time for a known set of jobs?",
      marks: 2,
      options: ["FCFS", "Round Robin", "Shortest Job First", "Priority"],
    },
    {
      id: "q2",
      type: "short",
      prompt: "Define a deadlock and list the four Coffman conditions.",
      marks: 4,
    },
    {
      id: "q3",
      type: "essay",
      prompt: "Compare paging and segmentation. Discuss trade-offs in fragmentation, address translation, and protection.",
      marks: 10,
    },
    {
      id: "q4",
      type: "math",
      prompt: "Given a page size of 4KB and a 32-bit address space, compute the number of entries in a single-level page table.",
      marks: 4,
    },
  ],
  // Add more exams here
};

const EXAM_INFO: Record<string, { title: string; module: string; duration: number; totalMarks: number }> = {
  "os-mid": {
    title: "Mid Semester Examination",
    module: "Operating Systems",
    duration: 90,
    totalMarks: 20,
  },
};

export default function ExamPaperPage() {
  const params = useParams();
  const examId = params.id as string;
  const [stage, setStage] = useState<Stage>("readiness");
  
  const questions = QUESTIONS[examId] || QUESTIONS["os-mid"];
  const examInfo = EXAM_INFO[examId] || EXAM_INFO["os-mid"];

  if (stage === "readiness") {
    return <Readiness examInfo={examInfo} onStart={() => setStage("active")} />;
  }
  if (stage === "active") {
    return <ActiveExam questions={questions} examInfo={examInfo} onSubmit={() => setStage("submitted")} />;
  }
  return <Submitted />;
}

/* ---------------- Stage 1 — Readiness (Instructions) ---------------- */

function Readiness({ examInfo, onStart }: { examInfo: any; onStart: () => void }) {
  const [checks, setChecks] = useState({
    network: true,
    fullscreen: false,
  });
  const allReady = Object.values(checks).every(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Exam Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{examInfo.module}</h1>
              <p className="text-sm text-muted-foreground mt-1">{examInfo.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold text-foreground">{examInfo.duration} minutes</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="text-sm font-semibold text-foreground">{examInfo.totalMarks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Instructions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Exam Instructions
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>• Duration: <span className="font-mono">{examInfo.duration} minutes</span> · Total marks: <span className="font-mono">{examInfo.totalMarks}</span></li>
                <li>• Answer all questions. Use the question navigator to move between items.</li>
                <li>• Once you click "Start Writing", the timer cannot be paused.</li>
                <li>• Closing the tab, switching windows, or exiting fullscreen is logged.</li>
                <li>• Auto-save runs every 5 seconds.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    AI Monitoring is enabled for this exam
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your screen activity will be monitored for academic integrity.
                    Tab switching and window changes are logged.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Pre-Exam Checks
              </h2>
              <ul className="mt-3 space-y-2">
                <CheckItem
                  icon={Wifi}
                  label="Stable network"
                  ok={checks.network}
                  onToggle={() => setChecks({ ...checks, network: !checks.network })}
                />
                <CheckItem
                  icon={Maximize2}
                  label="Fullscreen mode"
                  ok={checks.fullscreen}
                  onToggle={() => setChecks({ ...checks, fullscreen: !checks.fullscreen })}
                />
              </ul>
            </div>

            <button
              disabled={!allReady}
              onClick={onStart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <PenLine className="h-4 w-4" />
              Start Writing
            </button>
            {!allReady && (
              <p className="text-center text-xs text-muted-foreground">
                Complete all checks above to enable the start button.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ icon: Icon, label, ok, onToggle }: { icon: any; label: string; ok: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
          ok
            ? "border-green-300 bg-green-50 text-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-muted"
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
        )}
      </button>
    </li>
  );
}

/* ---------------- Stage 2 — Active Exam ---------------- */

function ActiveExam({ questions, examInfo, onSubmit }: { questions: Question[]; examInfo: any; onSubmit: () => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(examInfo.duration * 60);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const q = questions[current];
  const lowTime = secondsLeft < 5 * 60;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const answeredCount = Object.values(answers).filter((v) => v !== "" && v !== undefined).length;

  function setAnswer(v: string | number) {
    setAnswers({ ...answers, [q.id]: v });
  }

  function toggleFlag() {
    const s = new Set(flagged);
    if (s.has(q.id)) s.delete(q.id);
    else s.add(q.id);
    setFlagged(s);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Top bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600" />
              AI Monitoring Active
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {answeredCount} of {questions.length} answered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={`font-mono text-xl font-bold tabular-nums ${lowTime ? "text-red-600" : "text-foreground"}`}>
              {mm}:{ss}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Question workspace */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase">
                  {q.type === "mcq" ? "Multiple Choice" : q.type === "short" ? "Short Answer" : q.type === "essay" ? "Essay" : "Mathematics"}
                </span>
                <span className="text-xs text-muted-foreground">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
              </div>
              <button
                onClick={toggleFlag}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                  flagged.has(q.id)
                    ? "border-amber-400 bg-amber-50 text-amber-600"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {flagged.has(q.id) ? "Flagged" : "Flag"}
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Q{current + 1}. {q.prompt}
            </h3>

            <div className="mt-5">
              {q.type === "mcq" && q.options && (
                <ul className="space-y-2">
                  {q.options.map((opt, i) => {
                    const selected = answers[q.id] === i;
                    return (
                      <li key={i}>
                        <button
                          onClick={() => setAnswer(i)}
                          className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}>
                            {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                          <span>{opt}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {(q.type === "short" || q.type === "essay") && (
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={q.type === "essay" ? 10 : 4}
                  placeholder={`Type your ${q.type === "essay" ? "essay" : "answer"} here...`}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              )}
              {q.type === "math" && (
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Show your working… use $...$ for LaTeX"
                  className="w-full rounded-md border border-border bg-background px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              {current === questions.length - 1 ? (
                <button
                  onClick={() => setConfirmSubmit(true)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" /> Submit
                </button>
              ) : (
                <button
                  onClick={() => setCurrent((c) => c + 1)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigator */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Question Navigator
              </h4>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {questions.map((_, i) => {
                  const answered = answers[questions[i].id] !== undefined && answers[questions[i].id] !== "";
                  const isFlagged = flagged.has(questions[i].id);
                  const isCurrent = i === current;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`relative flex h-9 items-center justify-center rounded text-xs font-semibold transition ${
                        isCurrent ? "ring-2 ring-primary ring-offset-1 " : ""
                      } ${
                        answered
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {i + 1}
                      {isFlagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-sm bg-amber-500" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground">
                <span><span className="inline-block h-2 w-2 rounded bg-primary mr-1" /> Answered</span>
                <span><span className="inline-block h-2 w-2 rounded bg-muted mr-1" /> Unanswered</span>
                <span><span className="inline-block h-2 w-2 rounded-sm bg-amber-500 mr-1" /> Flagged</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Submit confirmation */}
        {confirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Submit your exam?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You answered {answeredCount} of {questions.length} questions. This cannot be undone.
                  </p>
                </div>
                <button onClick={() => setConfirmSubmit(false)} className="rounded p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirmSubmit(false)} className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                  Keep writing
                </button>
                <button onClick={onSubmit} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Submit now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Stage 3 — Submitted ---------------- */

function Submitted() {
  const ts = new Date().toLocaleString();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <FileCheck2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Submission received</h2>
          <p className="mt-1 text-sm text-muted-foreground">Operating Systems · Mid Semester</p>
          <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
            <div className="rounded-md border border-border bg-card p-3">
              <dt className="text-[11px] font-bold uppercase text-muted-foreground">Submitted at</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{ts}</dd>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <dt className="text-[11px] font-bold uppercase text-muted-foreground">Status</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">Awaiting grading</dd>
            </div>
          </dl>
          <Link href="/student/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}