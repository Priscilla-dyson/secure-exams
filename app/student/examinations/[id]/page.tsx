"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
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
  Maximize2,
  Wifi,
  Loader2,
  Eraser,
  Undo2,
  Redo2,
  Sigma,
  Trash2,
  Pencil,
  Square,
  Circle,
  ArrowRight,
} from "lucide-react";
import React from "react";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { AntiCheatWarning } from "@/components/anti-cheat-warning";

type Stage = "loading" | "readiness" | "active" | "submitted";

interface ExamData {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  scheduledDate: string;
  questions: QuestionData[];
}

interface QuestionData {
  id: string;
  type: string;
  text: string;
  marks: number;
  instructions?: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
}

export default function ExamPaperPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [stage, setStage] = useState<Stage>("loading");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    startExam();
  }, [examId]);

  const startExam = async () => {
    try {
      const response = await fetch(`/api/student/exams/${examId}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setAttemptId(data.attempt.id);
        setExamData({
          id: data.exam.id,
          title: data.exam.title,
          description: data.exam.description,
          duration: data.exam.duration,
          totalMarks: data.exam.totalMarks,
          scheduledDate: data.exam.scheduledDate,
          questions: data.exam.questions || [],
        });
        setRemainingSeconds(data.remainingSeconds);
        setStage("readiness");
      } else {
        setError(data.error || "Failed to load exam");
      }
    } catch (err) {
      console.error("Error fetching exam:", err);
      setError("Failed to load exam. Please try again.");
    }
  };

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">{error}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-primary hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  if (stage === "readiness" && examData) {
    return (
      <Readiness
        examData={examData}
        remainingSeconds={remainingSeconds}
        onStart={() => setStage("active")}
      />
    );
  }
  if (stage === "active" && examData) {
    return (
      <ActiveExam
        examData={examData}
        attemptId={attemptId!}
        remainingSeconds={remainingSeconds}
        onSubmit={() => setStage("submitted")}
      />
    );
  }
  return <Submitted />;
}

function Readiness({ examData, remainingSeconds, onStart }: { examData: ExamData; remainingSeconds: number; onStart: () => void }) {
  const [checks, setChecks] = useState({ network: true, fullscreen: false });
  const allReady = Object.values(checks).every(Boolean);

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{examData.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{examData.description || ''}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Time Remaining</p>
                <p className="text-sm font-mono font-semibold text-foreground">{mm}:{ss}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="text-sm font-semibold text-foreground">{examData.totalMarks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Exam Instructions</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>• Duration: <span className="font-mono">{examData.duration} minutes</span> · Total marks: <span className="font-mono">{examData.totalMarks}</span></li>
                <li>• Answer all questions. Use the question navigator to move between items.</li>
                <li>• Once you click "Start Writing", the timer cannot be paused.</li>
                <li>• Closing the tab, switching windows, or exiting fullscreen is logged and may auto-submit.</li>
                <li>• Copy/paste and keyboard shortcuts are disabled during the exam.</li>
                <li>• For math questions, use the LaTeX formula editor. For drawing questions, use the canvas tools provided.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Monitoring is enabled for this exam</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tab switching, fullscreen exits, and suspicious activity are tracked. Violations may auto-submit your exam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Pre-Exam Checks</h2>
              <ul className="mt-3 space-y-2">
                <CheckItem icon={Wifi} label="Stable network" ok={checks.network} onToggle={() => setChecks({ ...checks, network: !checks.network })} />
                <CheckItem icon={Maximize2} label="Fullscreen mode" ok={checks.fullscreen} onToggle={() => setChecks({ ...checks, fullscreen: !checks.fullscreen })} />
              </ul>
            </div>

            <button
              disabled={!allReady || remainingSeconds <= 0}
              onClick={onStart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <PenLine className="h-4 w-4" />
              Start Writing
            </button>
            {remainingSeconds <= 0 && (
              <p className="text-center text-xs text-destructive">Exam time has expired</p>
            )}
            {!allReady && remainingSeconds > 0 && (
              <p className="text-center text-xs text-muted-foreground">Complete all checks above to enable the start button.</p>
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
      <button onClick={onToggle} className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
        ok ? "border-green-300 bg-green-50 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"
      }`}>
        <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
        {ok ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>}
      </button>
    </li>
  );
}

// Math Input Component (LaTeX)
function MathInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(value || "\\text{Type a LaTeX formula...}");

  const updatePreview = (text: string) => {
    setPreview(text || "\\text{Type a LaTeX formula...}");
    onChange(text);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/30 p-4 min-h-[60px] flex items-center justify-center overflow-x-auto">
        <span className="text-lg text-foreground font-mono">{preview}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Sigma className="h-3.5 w-3.5" />
        <span>Enter your answer using LaTeX notation. Examples: <code className="bg-muted px-1 rounded">{'\\frac{a}{b}'}</code>, <code className="bg-muted px-1 rounded">{'\\sqrt{x}'}</code>, <code className="bg-muted px-1 rounded">{'\\sum_{i=1}^{n}'}</code></span>
      </div>
      <textarea
        value={value}
        onChange={(e) => updatePreview(e.target.value)}
        placeholder="e.g. \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
        rows={3}
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <div className="flex flex-wrap gap-2">
        {[String.raw`\frac{a}{b}`, String.raw`\sqrt{x}`, String.raw`x^2`, String.raw`x_n`, String.raw`\pi`, String.raw`\theta`, String.raw`\alpha`, String.raw`\beta`, String.raw`\sum`, String.raw`\int`, String.raw`\leq`, String.raw`\geq`, String.raw`\neq`, String.raw`\infty`, String.raw`\pm`, String.raw`\times`, String.raw`\div`, String.raw`\cdot`].map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => updatePreview(value + sym + " ")}
            className="rounded border border-border bg-background px-2 py-1 text-xs font-mono hover:bg-muted transition"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}

// Drawing Canvas Component
type Tool = "pen" | "eraser" | "line" | "rect" | "circle";

function DrawingCanvas({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    if (value && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, []);

  const getCanvasData = useCallback(() => {
    return canvasRef.current?.toDataURL() || "";
  }, []);

  const saveState = useCallback(() => {
    const data = getCanvasData();
    setUndoStack(prev => [...prev.slice(-20), data]);
    setRedoStack([]);
  }, [getCanvasData]);

  const undo = () => {
    if (undoStack.length === 0) return;
    const current = getCanvasData();
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, current]);
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current!.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      onChange(getCanvasData());
    };
    img.src = previous;
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const current = getCanvasData();
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, current]);
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current!.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      onChange(getCanvasData());
    };
    img.src = next;
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      saveState();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      onChange("");
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === "pen" || tool === "eraser") {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (tool === "line" && startPos) {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "rect" && startPos) {
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    } else if (tool === "circle" && startPos) {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
    setStartPos(null);
    saveState();
    onChange(getCanvasData());
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [tool, color, lineWidth]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <ToolButton icon={<Pencil className="h-4 w-4" />} active={tool === "pen"} onClick={() => setTool("pen")} title="Pen" />
          <ToolButton icon={<Eraser className="h-4 w-4" />} active={tool === "eraser"} onClick={() => setTool("eraser")} title="Eraser" />
          <ToolButton icon={<ArrowRight className="h-4 w-4" />} active={tool === "line"} onClick={() => setTool("line")} title="Line" />
          <ToolButton icon={<Square className="h-4 w-4" />} active={tool === "rect"} onClick={() => setTool("rect")} title="Rectangle" />
          <ToolButton icon={<Circle className="h-4 w-4" />} active={tool === "circle"} onClick={() => setTool("circle")} title="Circle" />
        </div>
        <div className="flex items-center gap-2 border-r border-border pr-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-border" title="Color" />
          <select value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="rounded border border-border bg-background px-1 py-1 text-xs" title="Line width">
            <option value={1}>1px</option>
            <option value={3}>3px</option>
            <option value={5}>5px</option>
            <option value={8}>8px</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <ToolButton icon={<Undo2 className="h-4 w-4" />} onClick={undo} disabled={undoStack.length === 0} title="Undo" />
          <ToolButton icon={<Redo2 className="h-4 w-4" />} onClick={redo} disabled={redoStack.length === 0} title="Redo" />
          <ToolButton icon={<Trash2 className="h-4 w-4" />} onClick={clearCanvas} title="Clear" />
        </div>
      </div>
      <div className="rounded-md border border-border bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          className="touch-none w-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <p className="text-xs text-muted-foreground">Use the canvas above to draw your answer. Supports pen, shapes, eraser, and undo/redo.</p>
    </div>
  );
}

function ToolButton({ icon, active, onClick, disabled, title }: { icon: React.ReactNode; active?: boolean; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded p-1.5 transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {icon}
    </button>
  );
}

// ActiveExam (Main exam-taking component)
function ActiveExam({ examData, attemptId, remainingSeconds, onSubmit }: { examData: ExamData; attemptId: string; remainingSeconds: number; onSubmit: () => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [drawings, setDrawings] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    violationCount,
    isLocked,
    warningMessage,
    requestFullscreen,
  } = useAntiCheat({
    enabled: true,
    maxViolations: 3,
    onViolation: (count) => { console.log(`Violation ${count} detected`); },
    onAutoSubmit: (reason: string) => { console.log(`Auto-submit: ${reason}`); handleSubmit(reason); },
    onFullscreenExit: () => { console.log('Fullscreen exited'); }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleSubmit("Time expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const q = examData.questions[current];
  const lowTime = secondsLeft < 5 * 60;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const answeredCount = examData.questions.filter((question) => {
    const ans = answers[question.id];
    const drawing = drawings[question.id];
    if (question.type === "MATH") return ans !== undefined && String(ans).trim().length > 0;
    if (question.type === "DRAWING") return drawing !== undefined && drawing.length > 100;
    return ans !== undefined && ans !== "" && ans !== null;
  }).length;

  function setAnswer(v: string) { setAnswers(prev => ({ ...prev, [q.id]: v })); }
  function setDrawingAnswer(v: string) { setDrawings(prev => ({ ...prev, [q.id]: v })); }
  function toggleFlag() {
    const s = new Set(flagged);
    if (s.has(q.id)) s.delete(q.id); else s.add(q.id);
    setFlagged(s);
  }

  const handleSubmit = async (reason?: string) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const answerList = examData.questions.map((question) => {
        if (question.type === "MULTIPLE_CHOICE") {
          const selectedIdx = parseInt(answers[question.id] || "-1", 10);
          const selectedOption = question.options?.[selectedIdx];
          return { questionId: question.id, selectedOptionId: selectedOption?.id || "", text: "" };
        }
        if (question.type === "DRAWING") {
          return { questionId: question.id, text: "", drawingImage: drawings[question.id] || "" };
        }
        if (question.type === "MATH") {
          return { questionId: question.id, text: String(answers[question.id] || "") };
        }
        return { questionId: question.id, text: String(answers[question.id] || "") };
      });

      const response = await fetch(`/api/student/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerList })
      });

      const data = await response.json();
      if (data.success) {
        onSubmit();
      } else {
        console.error('Submit error:', data.error);
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitting(false);
    }
  };

  if (!q) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">No questions available</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AntiCheatWarning isLocked={isLocked} warningMessage={warningMessage} violationCount={violationCount} maxViolations={3} onRequestFullscreen={requestFullscreen} />
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600" /> AI Monitoring Active
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">{answeredCount} of {examData.questions.length} answered</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={`font-mono text-xl font-bold tabular-nums ${lowTime ? "text-red-600" : "text-foreground"}`}>{mm}:{ss}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase">
                  {q.type === "MULTIPLE_CHOICE" ? "Multiple Choice" : q.type === "SHORT_ANSWER" ? "Short Answer" : q.type === "ESSAY" ? "Essay" : q.type === "MATH" ? "Math" : q.type === "DRAWING" ? "Drawing" : q.type}
                </span>
                <span className="text-xs text-muted-foreground">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
              </div>
              <button onClick={toggleFlag} className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${flagged.has(q.id) ? "border-amber-400 bg-amber-50 text-amber-600" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                <Flag className="h-3.5 w-3.5" />{flagged.has(q.id) ? "Flagged" : "Flag"}
              </button>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Q{current + 1}. {q.text}</h3>

            {q.instructions && (
              <p className="mt-2 text-sm text-muted-foreground italic">{q.instructions}</p>
            )}

            <div className="mt-5">
              {q.type === "MULTIPLE_CHOICE" && q.options && (
                <ul className="space-y-2">
                  {q.options.map((opt, i) => {
                    const selected = answers[q.id] === String(i);
                    return (
                      <li key={opt.id || i}>
                        <button onClick={() => setAnswer(String(i))} className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition ${selected ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`} />
                          <span>{opt.text}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {(q.type === "SHORT_ANSWER" || q.type === "ESSAY") && (
                <textarea value={(answers[q.id] as string) || ""} onChange={(e) => setAnswer(e.target.value)} rows={q.type === "ESSAY" ? 10 : 4} placeholder={`Type your ${q.type === "ESSAY" ? "essay" : "answer"} here...`} className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              )}

              {q.type === "MATH" && (
                <MathInput value={(answers[q.id] as string) || ""} onChange={(v) => setAnswer(v)} />
              )}

              {q.type === "DRAWING" && (
                <DrawingCanvas value={drawings[q.id] || ""} onChange={(v) => setDrawingAnswer(v)} />
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              {current === examData.questions.length - 1 ? (
                <button onClick={() => setConfirmSubmit(true)} disabled={submitting} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              ) : (
                <button onClick={() => setCurrent((c) => c + 1)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Question Navigator</h4>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {examData.questions.map((question, i) => {
                  const ans = answers[question.id];
                  const drawing = drawings[question.id];
                  let answered = false;
                  if (question.type === "MATH") answered = ans !== undefined && String(ans).trim().length > 0;
                  else if (question.type === "DRAWING") answered = drawing !== undefined && drawing.length > 100;
                  else answered = ans !== undefined && ans !== "" && ans !== null;

                  const isFlagged = flagged.has(question.id);
                  const isCurrent = i === current;
                  return (
                    <button key={i} onClick={() => setCurrent(i)} className={`relative flex h-9 items-center justify-center rounded text-xs font-semibold transition ${isCurrent ? "ring-2 ring-primary ring-offset-1 " : ""} ${answered ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                      {i + 1}{isFlagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-sm bg-amber-500" />}
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

        {confirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Submit your exam?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You answered {answeredCount} of {examData.questions.length} questions.</p>
                </div>
                <button onClick={() => setConfirmSubmit(false)} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirmSubmit(false)} className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Keep writing</button>
                <button onClick={() => handleSubmit()} disabled={submitting} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Submitted() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <FileCheck2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Submission received</h2>
          <p className="text-sm text-muted-foreground mt-1">Your responses have been recorded.</p>
          <Link href="/student/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}