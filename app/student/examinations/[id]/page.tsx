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
  Camera,
  CameraOff,
} from "lucide-react";
import React from "react";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useAIProctor } from "@/hooks/useAIProctor";
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

  const attemptIdRef = useRef<string | null>(null);
  attemptIdRef.current = attemptId;

  const loadExam = async () => {
    try {
      // First just fetch the exam data without creating an attempt
      const response = await fetch(`/api/student/exams/${examId}`);
      const data = await response.json();
      if (data.success) {
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

  const startAttempt = async () => {
    try {
      const response = await fetch(`/api/student/exams/${examId}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setAttemptId(data.attempt.id);
        setRemainingSeconds(data.remainingSeconds);
        setStage("active");
      } else {
        setError(data.error || "Failed to start exam");
      }
    } catch (err) {
      console.error("Error starting exam:", err);
      setError("Failed to start exam. Please try again.");
    }
  };

  useEffect(() => {
    loadExam();
  }, [examId]);

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
        onStart={startAttempt}
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
                <li>• Questions are randomly ordered. All answers will be saved.</li>
                <li>• Webcam AI proctoring monitors for suspicious behavior. Warnings are logged for lecturer review.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Monitoring & Webcam Proctoring is enabled</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tab switching, fullscreen exits, and suspicious activity are tracked. Browser violations may auto-submit your exam.
                    AI proctoring violations (face absence, multiple people, looking away) are logged for your lecturer to review.
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

// Math Input Component (LaTeX) with KaTeX rendering + WolframAlpha-style palette
function MathInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPalette, setShowPalette] = useState(true)
  const [activeGroup, setActiveGroup] = useState('fractions')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Render LaTeX preview with KaTeX
  useEffect(() => {
    if (!value.trim()) {
      setPreviewHtml('')
      return
    }
    let cancelled = false
    const render = async () => {
      try {
        const katex = await import('katex')
        if (cancelled) return
        const html = katex.default.renderToString(value, {
          throwOnError: false,
          displayMode: true,
          output: 'html'
        })
        setPreviewHtml(html)
      } catch {
        if (!cancelled) setPreviewHtml(`<span class="text-muted-foreground">${value}</span>`)
      }
    }
    render()
    return () => { cancelled = true }
  }, [value])

  const insertLatex = (latex: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = value.substring(0, start)
      const after = value.substring(end)
      const newText = before + latex + after
      onChange(newText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + latex.length, start + latex.length)
      }, 0)
    } else {
      onChange(value + latex)
    }
  }

  const symbols = [
    { label: '\\frac{a}{b}', latex: '\\frac{a}{b}', group: 'fractions', render: '\\frac{a}{b}' },
    { label: '\\frac{dy}{dx}', latex: '\\frac{dy}{dx}', group: 'fractions', render: '\\frac{dy}{dx}' },
    { label: 'x^n', latex: 'x^{n}', group: 'powers', render: 'x^{n}' },
    { label: '\\sqrt{x}', latex: '\\sqrt{x}', group: 'powers', render: '\\sqrt{x}' },
    { label: '\\sqrt[n]{x}', latex: '\\sqrt[n]{x}', group: 'powers', render: '\\sqrt[3]{x}' },
    { label: '\\int', latex: '\\int', group: 'calculus', render: '\\int' },
    { label: '\\int_a^b', latex: '\\int_{a}^{b}', group: 'calculus', render: '\\int_{a}^{b}' },
    { label: '\\sum', latex: '\\sum', group: 'calculus', render: '\\sum' },
    { label: '\\sum_{n=1}^{\\infty}', latex: '\\sum_{n=1}^{\\infty}', group: 'calculus', render: '\\sum_{n=1}^{\\infty}' },
    { label: 'α', latex: '\\alpha', group: 'greek', render: '\\alpha' },
    { label: 'β', latex: '\\beta', group: 'greek', render: '\\beta' },
    { label: 'π', latex: '\\pi', group: 'greek', render: '\\pi' },
    { label: 'θ', latex: '\\theta', group: 'greek', render: '\\theta' },
    { label: '≠', latex: '\\neq', group: 'relations', render: '\\neq' },
    { label: '≤', latex: '\\leq', group: 'relations', render: '\\leq' },
    { label: '≥', latex: '\\geq', group: 'relations', render: '\\geq' },
    { label: '×', latex: '\\times', group: 'operators', render: '\\times' },
    { label: '÷', latex: '\\div', group: 'operators', render: '\\div' },
    { label: '±', latex: '\\pm', group: 'operators', render: '\\pm' },
    { label: '→', latex: '\\rightarrow', group: 'arrows', render: '\\rightarrow' },
    { label: '⇒', latex: '\\Rightarrow', group: 'arrows', render: '\\Rightarrow' },
    { label: '∪', latex: '\\cup', group: 'sets', render: '\\cup' },
    { label: '∩', latex: '\\cap', group: 'sets', render: '\\cap' },
    { label: '∈', latex: '\\in', group: 'sets', render: '\\in' },
    { label: '∅', latex: '\\emptyset', group: 'sets', render: '\\emptyset' },
  ]

  const groups = [
    { id: 'fractions', label: 'Fractions' },
    { id: 'powers', label: 'Powers/Roots' },
    { id: 'calculus', label: 'Calculus' },
    { id: 'greek', label: 'Greek' },
    { id: 'relations', label: 'Relations' },
    { id: 'operators', label: 'Operators' },
    { id: 'arrows', label: 'Arrows' },
    { id: 'sets', label: 'Sets' },
  ]

  // Palette button with rendered KaTeX
  function PaletteBtn({ sym }: { sym: typeof symbols[0] }) {
    const [html, setHtml] = useState('')
    useEffect(() => {
      let cancelled = false
      import('katex').then(katex => {
        if (cancelled) return
        setHtml(katex.default.renderToString(sym.render, { throwOnError: false, displayMode: false, output: 'html' }))
      }).catch(() => { if (!cancelled) setHtml(`<span>${sym.label}</span>`) })
      return () => { cancelled = true }
    }, [sym.render, sym.label])
    return (
      <button type="button" onClick={() => insertLatex(sym.latex)} title={`Insert: ${sym.latex}`} className="w-12 h-9 flex items-center justify-center bg-background border border-border rounded hover:bg-primary/10 hover:border-primary/40 text-xs">
        <span className="[&_.katex]:text-sm" dangerouslySetInnerHTML={{ __html: html }} />
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {showPalette && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-1.5">
          <div className="flex flex-wrap gap-1 mb-1">
            {groups.map(g => (
              <button key={g.id} type="button" onClick={() => setActiveGroup(g.id)} className={`text-[10px] px-2 py-0.5 rounded ${activeGroup === g.id ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}>{g.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {symbols.filter(s => s.group === activeGroup).map((sym, i) => (
              <PaletteBtn key={i} sym={sym} />
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      {value.trim() && (
        <div className="rounded-md border border-border/50 bg-white dark:bg-background p-3 min-h-[50px] flex items-center justify-center overflow-x-auto">
          <div className="text-lg" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowPalette(!showPalette)}
        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <Sigma className="w-3 h-3" />
        {showPalette ? 'Hide' : 'Show'} formula palette
      </button>
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

// ActiveExam (Main exam-taking component) - with AI proctoring, question randomization, and enhanced anti-cheat
function ActiveExam({ examData, attemptId, remainingSeconds, onSubmit }: { examData: ExamData; attemptId: string; remainingSeconds: number; onSubmit: () => void }) {
  // 🔒 Secure question delivery: Shuffle questions randomly per student (prevents previewing all questions)
  const [shuffledQuestions] = useState(() => {
    const qs = [...examData.questions];
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    return qs;
  });

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [drawings, setDrawings] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenViolations, setFullscreenViolations] = useState(0);
  const [faceWarnings, setFaceWarnings] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [aiProctorEnabled, setAiProctorEnabled] = useState(true);
  const antiCheatLoggedRef = useRef<Set<string>>(new Set());

  // Refs to avoid stale closures in timer and anti-cheat callbacks
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const drawingsRef = useRef(drawings);
  drawingsRef.current = drawings;
  const tabSwitchCountRef = useRef(tabSwitchCount);
  tabSwitchCountRef.current = tabSwitchCount;
  const fullscreenViolationsRef = useRef(fullscreenViolations);
  fullscreenViolationsRef.current = fullscreenViolations;
  const faceWarningsRef = useRef(faceWarnings);
  faceWarningsRef.current = faceWarnings;
  const suspiciousActivityRef = useRef(suspiciousActivity);
  suspiciousActivityRef.current = suspiciousActivity;
  const submittingRef = useRef(submitting);
  submittingRef.current = submitting;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  // Log AI proctoring violation to server - LOG-ONLY, NEVER auto-submits
  const logAIViolation = useCallback(async (violationType: string, details: string) => {
    if (!attemptId) return;
    try {
      await fetch(`/api/student/attempts/${attemptId}/ai-proctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violationType, details })
      });
    } catch (err) {
      console.error('Failed to log AI proctor violation:', err);
    }
  }, [attemptId]);

  // Send browser anti-cheat violation to server
  const logAntiCheatViolation = useCallback(async (violationType: string, details?: string, durationAway?: number) => {
    if (!attemptId) return;
    const key = `${violationType}_${Date.now()}`;
    if (antiCheatLoggedRef.current.has(key)) return;
    antiCheatLoggedRef.current.add(key);
    try {
      await fetch(`/api/student/attempts/${attemptId}/anti-cheat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violationType, details, durationAway })
      });
    } catch (err) {
      console.error('Failed to log anti-cheat violation:', err);
    }
  }, [attemptId]);

  // Update antiCheatData in handleSubmit to match refs + ensure submittedAt is set
  const handleSubmit = useCallback(async (reason?: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const currentAnswers = answersRef.current;
      const currentDrawings = drawingsRef.current;
      const answerList = shuffledQuestions.map((question) => {
        if (question.type === "MULTIPLE_CHOICE") {
          const selectedIdx = parseInt(currentAnswers[question.id] || "-1", 10);
          const selectedOption = question.options?.[selectedIdx];
          return { questionId: question.id, selectedOptionId: selectedOption?.id || "", text: "" };
        }
        if (question.type === "DRAWING") {
          return { questionId: question.id, text: "", drawingImage: currentDrawings[question.id] || "" };
        }
        if (question.type === "MATH") {
          return { questionId: question.id, text: String(currentAnswers[question.id] || "") };
        }
        return { questionId: question.id, text: String(currentAnswers[question.id] || "") };
      });

      const response = await fetch(`/api/student/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answerList,
          antiCheatData: {
            tabSwitchCount: tabSwitchCountRef.current,
            fullscreenViolations: fullscreenViolationsRef.current,
            faceDetectionWarnings: faceWarningsRef.current,
            suspiciousActivity: suspiciousActivityRef.current
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        // Stop AI proctor before navigating
        stopWebcam();
        onSubmitRef.current();
      } else {
        console.error('Submit error:', data.error);
        setSubmitting(false);
        submittingRef.current = false;
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [shuffledQuestions, attemptId]);

  // UseAntiCheat hook - handles browser violations (tab switch, fullscreen, copy/paste)
  // These CAN auto-submit after maxViolations (default 3)
  const {
    violationCount,
    isLocked,
    warningMessage,
    aiViolations,
    aiWarningMessage,
    handleAIViolation,
    requestFullscreen,
  } = useAntiCheat({
    enabled: true,
    maxViolations: 3,
    onViolation: (count, type) => {
      if (type) {
        console.log(`AI Violation: ${type}`);
      } else {
        console.log(`Browser Violation ${count}`);
      }
    },
    onAutoSubmit: (reason: string) => {
      console.log(`Auto-submit: ${reason}`);
      handleSubmit(reason);
    },
    onFullscreenExit: () => {
      console.log('Fullscreen exited');
      setFullscreenViolations(prev => prev + 1);
      logAntiCheatViolation('FULLSCREEN_EXIT', 'Student exited fullscreen mode');
    },
    onAIViolation: (type, details) => {
      console.log(`AI Proctor: ${type} - ${details}`);
      logAIViolation(type, details);
    }
  });

  // AI Proctoring integration (LOG-ONLY, never triggers auto-submit)
  const {
    isActive: aiProctorActive,
    proctorState,
    error: aiProctorError,
    warningMessage: aiProctorWarning,
    startWebcam,
    stopWebcam
  } = useAIProctor({
    enabled: aiProctorEnabled,
    attemptId,
    onViolation: (type, details) => {
      handleAIViolation(type, details);
      // Track face-related violations for submission data
      if (type === 'FACE_ABSENT' || type === 'MULTIPLE_FACES') {
        setFaceWarnings(prev => prev + 1);
      }
    }
  });

  // Initialize AI proctor webcam when exam goes active
  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
  }, [startWebcam, stopWebcam]);

  // Log tab switches in real-time (browser anti-cheat)
  useEffect(() => {
    if (!attemptId) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        logAntiCheatViolation('TAB_SWITCH', 'Student switched to another tab');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptId, logAntiCheatViolation]);

  // Log multiple login detection on mount
  useEffect(() => {
    if (!attemptId) return;
    fetch(`/api/student/attempts/${attemptId}/login-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceInfo: navigator.userAgent })
    }).catch(err => console.error('Login check failed:', err));
  }, [attemptId]);

  // Log focus loss (app switching) - browser anti-cheat
  useEffect(() => {
    if (!attemptId) return;
    let blurTimer: NodeJS.Timeout;
    const handleBlur = () => {
      blurTimer = setTimeout(() => {
        logAntiCheatViolation('FOCUS_LOSS', 'Student clicked outside the browser window');
      }, 3000);
    };
    const handleFocus = () => {
      clearTimeout(blurTimer);
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearTimeout(blurTimer);
    };
  }, [attemptId, logAntiCheatViolation]);

  // Log keyboard shortcuts and copy/paste - browser anti-cheat
  useEffect(() => {
    if (!attemptId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 't' || e.key === 'u' || e.key === 's' || e.key === 'p')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        e.key === 'F12'
      ) {
        logAntiCheatViolation('KEYBOARD_SHORTCUT', `Prohibited shortcut: ${e.ctrlKey ? 'Ctrl+' : ''}${e.key}`);
        setSuspiciousActivity(true);
      }
    };
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logAntiCheatViolation('COPY_PASTE', 'Copy attempt detected');
      setSuspiciousActivity(true);
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logAntiCheatViolation('COPY_PASTE', 'Paste attempt detected');
      setSuspiciousActivity(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [attemptId, logAntiCheatViolation]);

  // Timer - uses ref-based handleSubmit to avoid stale closures
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleSubmitRef.current("Time expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const q = shuffledQuestions[current];
  const lowTime = secondsLeft < 5 * 60;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const answeredCount = shuffledQuestions.filter((question) => {
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

  if (!q) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">No questions available</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AntiCheatWarning 
        isLocked={isLocked} 
        warningMessage={warningMessage} 
        violationCount={violationCount} 
        maxViolations={3} 
        onRequestFullscreen={requestFullscreen}
        aiWarningMessage={aiWarningMessage}
        aiViolations={aiViolations}
      />
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Top Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600" /> AI Monitoring Active
            </span>
            {aiProctorActive && (
              <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                <Camera className="h-3 w-3" /> Proctor
              </span>
            )}
            {!aiProctorActive && aiProctorError && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                <CameraOff className="h-3 w-3" /> No Camera
              </span>
            )}
            <span className="hidden text-xs text-muted-foreground sm:inline">{answeredCount} of {shuffledQuestions.length} answered</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={`font-mono text-xl font-bold tabular-nums ${lowTime ? "text-red-600" : "text-foreground"}`}>{mm}:{ss}</span>
          </div>
        </div>

        {/* AI Proctor Warning Banner (non-blocking, NOT auto-submit) */}
        {aiWarningMessage && !isLocked && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-3">
            <Camera className="h-5 w-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">{aiWarningMessage}</p>
          </div>
        )}

        {/* AI Proctor Status Bar */}
        {aiProctorActive && (
          <div className="mb-4 rounded-lg border border-border bg-card p-2 px-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${proctorState.faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
              Face
            </span>
            <span className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${!proctorState.multipleFaces ? 'bg-green-500' : 'bg-red-500'}`} />
              Single Person
            </span>
            <span className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${!proctorState.lookingAway ? 'bg-green-500' : 'bg-amber-500'}`} />
              Looking at Screen
            </span>
            <span className="ml-auto text-[10px] opacity-60">AI Proctor v1.0</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main Question Area */}
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
              {current === shuffledQuestions.length - 1 ? (
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

          {/* Question Navigator Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Question Navigator</h4>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {shuffledQuestions.map((question, i) => {
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

        {/* Submit Confirmation Modal */}
        {confirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Submit your exam?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You answered {answeredCount} of {shuffledQuestions.length} questions.</p>
                </div>
                <button onClick={() => setConfirmSubmit(false)} className="rounded p-1 text-muted-foreground hover:bg-muted" title="Close" aria-label="Close"><X className="h-4 w-4" /></button>
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