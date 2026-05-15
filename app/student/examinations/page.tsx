"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Maximize2,
  ShieldCheck,
  Mic,
  Wifi,
  Eye,
  AlertTriangle,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
  PenLine,
  Calculator,
  FileCheck2,
  X,
} from "lucide-react";

type Stage = "readiness" | "active" | "submitted";
type QType = "mcq" | "short" | "essay" | "math";

interface Question {
  id: string;
  type: QType;
  prompt: string;
  marks: number;
  options?: string[];
}

const QUESTIONS: Question[] = [
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
    prompt:
      "Compare paging and segmentation. Discuss trade-offs in fragmentation, address translation, and protection.",
    marks: 10,
  },
  {
    id: "q4",
    type: "math",
    prompt:
      "Given a page size of 4KB and a 32-bit address space, compute the number of entries in a single-level page table.",
    marks: 4,
  },
];

export default function ExamFlow() {
  const [stage, setStage] = useState<Stage>("readiness");

  return (
    <div>
      <div className="p-6 sm:p-8">
        {stage === "readiness" && (
          <Readiness onStart={() => setStage("active")} />
        )}
        {stage === "active" && (
          <ActiveExam onSubmit={() => setStage("submitted")} />
        )}
        {stage === "submitted" && <Submitted />}
      </div>
    </div>
  );
}

/* ---------------- Stage 1 — Readiness ---------------- */

function Readiness({ onStart }: { onStart: () => void }) {
  const [checks, setChecks] = useState({
    camera: false,
    mic: false,
    network: true,
    fullscreen: false,
    identity: false,
  });
  const allReady = Object.values(checks).every(Boolean);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
      {/* Instructions */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Exam Instructions
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            <li>• Duration: <span className="font-mono">90 minutes</span> · Total marks: <span className="font-mono">20</span></li>
            <li>• Answer all questions. Use the question navigator to move between items.</li>
            <li>• Once you click "Start Writing", the timer cannot be paused.</li>
            <li>• Closing the tab, switching windows, or exiting fullscreen is logged.</li>
            <li>• Auto-save runs every 5 seconds. Manual save is available at any time.</li>
          </ul>
        </div>

        <div className="rounded-md border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-[color:var(--warning)]" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                AI Monitoring is enabled for this exam
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your camera, microphone, and screen activity will be analysed for academic
                integrity. Recordings are encrypted and reviewed only on flag.
              </p>
            </div>
          </div>
        </div>

        {/* Camera preview */}
        <div className="rounded-md border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Camera Preview
            </h2>
            <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
              <Eye className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-foreground/90">
            <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/70">
              <Camera className="h-10 w-10" />
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded bg-destructive/90 px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive-foreground" />
              REC
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Position your face inside the frame and ensure good lighting.
          </p>
        </div>
      </div>

      {/* Checks */}
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Device & Identity Checks
          </h2>
          <ul className="mt-3 space-y-2">
            <Check
              icon={Camera}
              label="Camera access"
              ok={checks.camera}
              onToggle={() => setChecks({ ...checks, camera: !checks.camera })}
            />
            <Check
              icon={Mic}
              label="Microphone access"
              ok={checks.mic}
              onToggle={() => setChecks({ ...checks, mic: !checks.mic })}
            />
            <Check
              icon={Wifi}
              label="Stable network"
              ok={checks.network}
              onToggle={() => setChecks({ ...checks, network: !checks.network })}
            />
            <Check
              icon={Maximize2}
              label="Fullscreen mode"
              ok={checks.fullscreen}
              onToggle={() => setChecks({ ...checks, fullscreen: !checks.fullscreen })}
            />
            <Check
              icon={ShieldCheck}
              label="Identity verified"
              ok={checks.identity}
              onToggle={() => setChecks({ ...checks, identity: !checks.identity })}
            />
          </ul>
        </div>

        <button
          disabled={!allReady}
          onClick={onStart}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
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
  );
}

function Check({
  icon: Icon,
  label,
  ok,
  onToggle,
}: {
  icon: typeof Camera;
  label: string;
  ok: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        onClick={onToggle}
        className={
          "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition " +
          (ok
            ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5 text-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-muted")
        }
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Pending
          </span>
        )}
      </button>
    </li>
  );
}

/* ---------------- Stage 2 — Active Exam ---------------- */

function ActiveExam({ onSubmit }: { onSubmit: () => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(90 * 60);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    tickRef.current = window.setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const q = QUESTIONS[current];
  const lowTime = secondsLeft < 5 * 60;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v !== "" && v !== undefined).length,
    [answers],
  );

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
    <div className="mx-auto max-w-7xl">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded bg-[color:var(--success)]/10 px-2 py-1 text-[11px] font-semibold text-[color:var(--success)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--success)]" />
            AI Monitoring · OK
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {answeredCount} of {QUESTIONS.length} answered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span
            className={
              "font-mono text-base font-bold tabular-nums " +
              (lowTime ? "text-destructive" : "text-foreground")
            }
          >
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Question workspace */}
        <div className="rounded-md border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                {labelFor(q.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {q.marks} mark{q.marks > 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={toggleFlag}
              className={
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition " +
                (flagged.has(q.id)
                  ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]"
                  : "border-border bg-background text-muted-foreground hover:bg-muted")
              }
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
                        className={
                          "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition " +
                          (selected
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted")
                        }
                      >
                        <span
                          className={
                            "flex h-5 w-5 items-center justify-center rounded-full border " +
                            (selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border")
                          }
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {q.type === "short" && (
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="Type your answer…"
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            )}
            {q.type === "essay" && (
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={(e) => setAnswer(e.target.value)}
                rows={12}
                placeholder="Write your essay…"
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            )}
            {q.type === "math" && (
              <div className="space-y-3">
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Show your working… use $...$ for inline LaTeX"
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  <Calculator className="h-3.5 w-3.5" /> Open calculator
                </button>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Auto-saved a moment ago
            </span>
            {current === QUESTIONS.length - 1 ? (
              <button
                onClick={() => setConfirmSubmit(true)}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Send className="h-4 w-4" /> Submit
              </button>
            ) : (
              <button
                onClick={() => setCurrent((c) => Math.min(QUESTIONS.length - 1, c + 1))}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar — navigator */}
        <aside className="space-y-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Question Navigator
            </h4>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {QUESTIONS.map((qq, i) => {
                const answered = answers[qq.id] !== undefined && answers[qq.id] !== "";
                const isFlagged = flagged.has(qq.id);
                const isCurrent = i === current;
                return (
                  <button
                    key={qq.id}
                    onClick={() => setCurrent(i)}
                    className={
                      "relative flex h-9 items-center justify-center rounded text-xs font-semibold transition " +
                      (isCurrent
                        ? "underline underline-offset-4 "
                        : "") +
                      (answered
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-accent")
                    }
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-sm bg-[color:var(--warning)]" />
                    )}
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 space-y-1 text-[11px] text-muted-foreground">
              <li><span className="mr-2 inline-block h-2 w-2 rounded bg-primary" /> Answered</li>
              <li><span className="mr-2 inline-block h-2 w-2 rounded bg-muted" /> Unanswered</li>
              <li><span className="mr-2 inline-block h-2 w-2 rounded-sm bg-[color:var(--warning)]" /> Flagged</li>
            </ul>
          </div>

          <div className="rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Status</p>
            <p className="mt-1">Fullscreen enforced · tab-switch detection on</p>
          </div>
        </aside>
      </div>

      {/* Submit confirm */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Submit your exam?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You answered {answeredCount} of {QUESTIONS.length} questions. This action
                  cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setConfirmSubmit(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Keep writing
              </button>
              <button
                onClick={onSubmit}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function labelFor(t: QType) {
  return t === "mcq"
    ? "Multiple Choice"
    : t === "short"
    ? "Short Answer"
    : t === "essay"
    ? "Essay"
    : "Math";
}

/* ---------------- Stage 3 — Submitted ---------------- */

function Submitted() {
  const ts = new Date().toLocaleString();
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-md border border-[color:var(--success)]/30 bg-[color:var(--success)]/5 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
          <FileCheck2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Submission received
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Operating Systems · Mid Semester
        </p>
        <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
          <Meta label="Submitted at" value={ts} />
          <Meta label="Reference" value="SUB-OS-208341" />
          <Meta label="Integrity" value="Verified" />
          <Meta label="Status" value="Awaiting grading" />
        </dl>
        <p className="mt-6 text-xs text-muted-foreground">
          You will be notified when your result is released.
        </p>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}