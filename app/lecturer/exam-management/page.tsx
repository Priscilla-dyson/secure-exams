'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Calendar,
  Clock,
  Users,
  FileText,
  Trash2,
  BookOpen,
  ListChecks,
  X,
  HelpCircle,
  GraduationCap,
  CheckCircle2,
  Send,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sigma,
  Pencil,
  Eraser,
  Image,
  Undo2,
  Redo2,
  GripVertical,
  AlertCircle,
} from 'lucide-react'
import MathInput, { InlineMath, DisplayMath } from '@/components/MathInput'

interface Module {
  id: string
  name: string
  code: string
  class: { id: string; name: string; year: number }
  program: { id: string; name: string }
}

interface Exam {
  id: string
  title: string
  description: string | null
  type: string
  moduleId: string
  module: { name: string; code: string }
  duration: number
  totalMarks: number
  passingMarks: number
  scheduledDate: string
  endDate: string
  status: string
  published: boolean
  showResults: boolean
  allowLateSubmission: boolean
  _count?: { examAttempts: number }
}

interface SubQuestion {
  id: string
  label: string
  category: 'MATH' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  text: string
  marks: number
  mathAnswer?: string
  correctAnswer?: string
  tolerance?: number
  options?: { text: string; isCorrect: boolean }[]
}

interface Question {
  id: string
  type: string
  text: string
  marks: number
  order: number
  options?: { text: string; isCorrect: boolean }[]
  correctAnswer?: string
  mathAnswer?: string
  tolerance?: number
  // Structured sub-questions (1a, 1b, 1c)
  subQuestions?: SubQuestion[]
}

const emptyForm = {
  description: '',
  type: 'midterm',
  moduleId: '',
  duration: '60',
  totalMarks: '100',
  passingMarks: '40',
  scheduledDate: '',
  endDate: '',
  showResults: true,
  allowLateSubmission: false,
}

function DrawingCanvas({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (value) {
      const img = document.createElement('img')
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = value
    }
  }, [])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const saveState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setUndoStack(prev => [...prev, canvas.toDataURL()])
    setRedoStack([])
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e)
    if (!pos) return
    setIsDrawing(true)
    setLastPos(pos)
    saveState()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const pos = getPos(e)
    if (!ctx || !pos || !lastPos) return

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    setLastPos(pos)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPos(null)
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL())
  }

  const handleUndo = () => {
    const canvas = canvasRef.current
    if (!canvas || undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...redoStack, canvas.toDataURL()])
    setUndoStack(prev => prev.slice(0, -1))
    const img = document.createElement('img')
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(img, 0, 0)
    }
    img.src = prev
  }

  const handleRedo = () => {
    const canvas = canvasRef.current
    if (!canvas || redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, canvas.toDataURL()])
    setRedoStack(prev => prev.slice(0, -1))
    const img = document.createElement('img')
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(img, 0, 0)
    }
    img.src = next
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    saveState()
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    onChange(canvas.toDataURL())
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        saveState()
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        onChange(canvas.toDataURL())
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-t-lg border border-gray-200">
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded ${tool === 'pen' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
            title="Pen"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-6 h-6 p-0 border-0 cursor-pointer"
            title="Color"
          />
          <select
            value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
            className="h-7 text-xs border border-gray-200 rounded px-1"
            title="Line width"
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={4}>4px</option>
            <option value={6}>6px</option>
          </select>
        </div>
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button type="button" onClick={handleUndo} disabled={undoStack.length === 0} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Undo">
            <Undo2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={handleRedo} disabled={redoStack.length === 0} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Redo">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <label className="p-1.5 rounded hover:bg-gray-200 cursor-pointer" title="Upload image">
            <Image className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <button type="button" onClick={handleClear} className="p-1.5 rounded hover:bg-gray-200 text-red-500" title="Clear canvas">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="border border-gray-200 rounded-b-lg cursor-crosshair w-full"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  )
}

/**
 * Sub-question editor for STRUCTURED questions (1a, 1b, 1c)
 */
function SubQuestionEditor({
  subQuestion,
  index,
  onChange,
  onRemove,
}: {
  subQuestion: SubQuestion
  index: number
  onChange: (updated: SubQuestion) => void
  onRemove: () => void
}) {
  const label = `${index + 1}`

  return (
    <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary font-bold">
            Part ({label})
          </Badge>
          <Select
            value={subQuestion.category}
            onValueChange={(v) => onChange({ ...subQuestion, category: v as SubQuestion['category'] })}
          >
            <SelectTrigger className="h-7 text-xs w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MATH">Math</SelectItem>
              <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="TRUE_FALSE">True/False</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Marks:</Label>
            <Input
              type="number"
              min={1}
              value={subQuestion.marks}
              onChange={e => onChange({ ...subQuestion, marks: parseInt(e.target.value) || 1 })}
              className="h-7 w-16 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Remove sub-question"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question text for this sub-part */}
      <div>
        <Label className="text-xs text-muted-foreground">Question {label}:</Label>
        <Textarea
          value={subQuestion.text}
          onChange={e => onChange({ ...subQuestion, text: e.target.value })}
          placeholder={`Enter question ${label} text (supports LaTeX with $...$)`}
          rows={2}
          className="text-sm mt-1"
        />
      </div>

      {/* Answer input based on category */}
      {subQuestion.category === 'MATH' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Expected Answer (LaTeX):</Label>
          <MathInput
            value={subQuestion.mathAnswer || ''}
            onChange={v => onChange({ ...subQuestion, mathAnswer: v })}
            placeholder="e.g., \\frac{1}{2}"
            label=""
            showSolve={false}
          />
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Tolerance:</Label>
            <Input
              type="number"
              min={0}
              step={0.001}
              value={subQuestion.tolerance ?? 0.01}
              onChange={e => onChange({ ...subQuestion, tolerance: parseFloat(e.target.value) || 0.01 })}
              className="h-7 w-20 text-xs"
            />
          </div>
        </div>
      )}

      {subQuestion.category === 'SHORT_ANSWER' && (
        <div>
          <Label className="text-xs text-muted-foreground">Correct Answer:</Label>
          <Input
            value={subQuestion.correctAnswer || ''}
            onChange={e => onChange({ ...subQuestion, correctAnswer: e.target.value })}
            placeholder="Expected answer text"
            className="h-8 text-sm mt-1"
          />
        </div>
      )}

      {subQuestion.category === 'TRUE_FALSE' && (
        <div className="flex items-center gap-3 mt-1">
          <Label className="text-xs text-muted-foreground">Correct Answer:</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...subQuestion, correctAnswer: 'true' })}
              className={`px-3 py-1 text-xs rounded border ${
                subQuestion.correctAnswer === 'true'
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              True
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...subQuestion, correctAnswer: 'false' })}
              className={`px-3 py-1 text-xs rounded border ${
                subQuestion.correctAnswer === 'false'
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              False
            </button>
          </div>
        </div>
      )}

      {subQuestion.category === 'MULTIPLE_CHOICE' && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Options:</Label>
          {subQuestion.options?.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`mcq-sub-${index}`}
                checked={opt.isCorrect}
                onChange={() =>
                  onChange({
                    ...subQuestion,
                    options: subQuestion.options?.map((o, j) => ({ ...o, isCorrect: j === oi })),
                  })
                }
                className="w-4 h-4 accent-primary shrink-0"
              />
              <Input
                value={opt.text}
                onChange={e => {
                  const opts = [...(subQuestion.options || [])]
                  opts[oi] = { ...opts[oi], text: e.target.value }
                  onChange({ ...subQuestion, options: opts })
                }}
                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                className="flex-1 h-8 text-sm"
              />
              {(subQuestion.options?.length || 0) > 2 && (
                <button
                  onClick={() =>
                    onChange({
                      ...subQuestion,
                      options: subQuestion.options?.filter((_, j) => j !== oi),
                    })
                  }
                  className="text-red-500 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              onChange({
                ...subQuestion,
                options: [...(subQuestion.options || []), { text: '', isCorrect: false }],
              })
            }
            className="text-xs text-primary font-medium"
          >
            + Add option
          </button>
        </div>
      )}
    </div>
  )
}

export default function ExamManagementPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ ...emptyForm })
  const [questions, setQuestions] = useState<Question[]>([])
  const [showAddQ, setShowAddQ] = useState(false)
  const [newQ, setNewQ] = useState<Partial<Question>>({
    type: 'MULTIPLE_CHOICE',
    text: '',
    marks: 5,
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    subQuestions: [],
  })
  const [canvasData, setCanvasData] = useState<string>('')

  useEffect(() => {
    Promise.all([fetchExams(), fetchModules()])
  }, [])

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams')
      const d = await res.json()
      if (d.success) setExams(d.exams)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/lecturer/modules')
      const d = await res.json()
      if (d.success) setModules(d.modules)
    } catch (e) { console.error(e) }
  }

  const openCreate = () => {
    setEditingExam(null)
    setForm({ ...emptyForm, moduleId: modules.length > 0 ? modules[0].id : '' })
    setQuestions([])
    setStep(1)
    setShowDialog(true)
  }

  const openEdit = async (exam: Exam) => {
    setEditingExam(exam)
    setForm({
      description: exam.description || '',
      type: exam.type,
      moduleId: exam.moduleId,
      duration: String(exam.duration),
      totalMarks: String(exam.totalMarks),
      passingMarks: String(exam.passingMarks),
      scheduledDate: exam.scheduledDate ? new Date(exam.scheduledDate).toISOString().slice(0, 16) : '',
      endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : '',
      showResults: exam.showResults,
      allowLateSubmission: exam.allowLateSubmission,
    })
    try {
      const res = await fetch(`/api/exams/${exam.id}/questions`)
      const d = await res.json()
      if (d.success) {
        setQuestions(d.questions.map((q: any) => {
          const question: Question = {
            id: q.id,
            type: q.category || q.type,
            text: q.text,
            marks: q.marks,
            order: q.order,
            options: q.options?.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })),
            correctAnswer: q.correctAnswer,
            mathAnswer: q.mathAnswer,
            tolerance: q.tolerance,
          }
          // Load sub-questions if STRUCTURED
          if ((q.category === 'STRUCTURED' || q.type === 'STRUCTURED') && q.subQuestions?.length > 0) {
            question.subQuestions = q.subQuestions.map((sq: any, idx: number) => ({
              id: sq.id,
              label: `${idx + 1}`,
              category: sq.category || 'SHORT_ANSWER',
              text: sq.text,
              marks: sq.marks || 1,
              mathAnswer: sq.mathAnswer,
              correctAnswer: sq.correctAnswer,
              tolerance: sq.tolerance,
              options: sq.options?.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })),
            }))
          }
          return question
        }))
      }
    } catch { setQuestions([]) }
    setStep(1)
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
    setEditingExam(null)
    setForm({ ...emptyForm })
    setQuestions([])
  }

  const handleSubmit = async (publish: boolean) => {
    if (!form.moduleId) { alert('Select a module'); return }
    if (!form.duration || parseInt(form.duration) < 1) { alert('Duration must be at least 1 minute'); return }
    setSubmitting(true)
    try {
      const mod = modules.find(m => m.id === form.moduleId)
      const title = `${mod?.code || ''} - ${form.type === 'midterm' ? 'Mid Semester' : form.type === 'final' ? 'Final' : form.type === 'quiz' ? 'Quiz' : 'Practical'}`
      const payload = {
        title,
        description: form.description.trim() || null,
        type: form.type, moduleId: form.moduleId,
        duration: parseInt(form.duration),
        totalMarks: parseInt(form.totalMarks) || 100,
        passingMarks: parseInt(form.passingMarks) || 40,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        showResults: form.showResults, allowLateSubmission: form.allowLateSubmission,
        published: publish, status: publish ? 'SCHEDULED' : 'DRAFT',
        questions: questions.map((q, i) => {
          const base: any = {
            category: q.type === 'STRUCTURED' ? 'STRUCTURED' :
                      q.type === 'MATH' ? 'MATH' :
                      q.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' :
                      q.type === 'SHORT_ANSWER' ? 'SHORT_ANSWER' :
                      q.type === 'TRUE_FALSE' ? 'TRUE_FALSE' :
                      q.type === 'ESSAY' ? 'ESSAY' :
                      'SHORT_ANSWER',
            text: q.text,
            marks: q.marks,
            order: i + 1,
            options: (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && q.options ? q.options : undefined,
            correctAnswer: q.type === 'TRUE_FALSE' ? q.correctAnswer :
                           q.type === 'SHORT_ANSWER' ? q.correctAnswer :
                           q.type === 'ESSAY' ? q.correctAnswer : undefined,
            mathAnswer: q.type === 'MATH' ? q.mathAnswer : undefined,
            tolerance: q.type === 'MATH' ? q.tolerance : undefined,
          }

          // For structured questions, include sub-questions
          if (q.type === 'STRUCTURED' && q.subQuestions && q.subQuestions.length > 0) {
            base.subQuestions = q.subQuestions.map((sq, sIdx) => ({
              category: sq.category,
              text: sq.text,
              marks: sq.marks,
              order: sIdx + 1,
              mathAnswer: sq.category === 'MATH' ? sq.mathAnswer : undefined,
              correctAnswer: sq.category !== 'MATH' ? sq.correctAnswer : undefined,
              tolerance: sq.category === 'MATH' ? sq.tolerance : undefined,
              options: sq.category === 'MULTIPLE_CHOICE' ? sq.options : undefined,
            }))
          }

          return base
        }),
      }
      const res = editingExam
        ? await fetch(`/api/exams/${editingExam.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) { await fetchExams(); closeDialog() }
      else alert(data.error || 'Failed to save')
    } catch { alert('Failed to save exam') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' })
      if (res.ok) setExams(exams.filter(e => e.id !== id))
      else { const d = await res.json(); alert(d.error || 'Failed to delete') }
    } catch { console.error }
  }

  const handleDuplicate = async (exam: Exam) => {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${exam.title} (Copy)`, type: exam.type, moduleId: exam.moduleId, duration: exam.duration, totalMarks: exam.totalMarks, passingMarks: exam.passingMarks, status: 'DRAFT' }),
      })
      const d = await res.json()
      if (d.success) await fetchExams()
      else alert(d.error || 'Failed to duplicate')
    } catch { console.error }
  }

  const addSubQuestion = () => {
    if (!newQ.subQuestions) {
      setNewQ({ ...newQ, subQuestions: [] })
    }
    const sq: SubQuestion = {
      id: `sq_${Date.now()}`,
      label: String((newQ.subQuestions?.length || 0) + 1),
      category: 'MATH',
      text: '',
      marks: 2,
      tolerance: 0.01,
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    }
    setNewQ({
      ...newQ,
      subQuestions: [...(newQ.subQuestions || []), sq],
    })
  }

  const updateSubQuestion = (index: number, updated: SubQuestion) => {
    const sqs = [...(newQ.subQuestions || [])]
    sqs[index] = updated
    setNewQ({ ...newQ, subQuestions: sqs })
  }

  const removeSubQuestion = (index: number) => {
    const sqs = (newQ.subQuestions || []).filter((_, i) => i !== index)
    setNewQ({ ...newQ, subQuestions: sqs })
  }

  const addQuestion = () => {
    if (newQ.type === 'STRUCTURED') {
      // Validate structured has sub-questions
      if (!newQ.subQuestions || newQ.subQuestions.length === 0) {
        alert('Add at least one sub-question (1a, 1b, etc.) for structured questions')
        return
      }
      // Validate each sub-question has text
      for (let i = 0; i < newQ.subQuestions.length; i++) {
        if (!newQ.subQuestions[i].text?.trim()) {
          alert(`Sub-question ${i + 1} needs question text`)
          return
        }
      }
      // Calculate total marks from sub-questions
      const totalSubMarks = newQ.subQuestions.reduce((sum, sq) => sum + sq.marks, 0)

      const question: Question = {
        id: `q_${Date.now()}`,
        type: 'STRUCTURED',
        text: newQ.text?.trim() || 'Answer all parts of the question:',
        marks: totalSubMarks,
        order: questions.length + 1,
        subQuestions: newQ.subQuestions.map(sq => ({ ...sq })),
      }
      setQuestions([...questions, question])
    } else if (newQ.type === 'MATH') {
      if (!newQ.text?.trim() && !newQ.mathAnswer?.trim()) {
        alert('Question text or math answer is required')
        return
      }
      if (!newQ.marks || newQ.marks < 1) { alert('Marks must be at least 1'); return }

      const question: Question = {
        id: `q_${Date.now()}`,
        type: 'MATH',
        text: newQ.text?.trim() || '',
        marks: newQ.marks,
        order: questions.length + 1,
        mathAnswer: newQ.mathAnswer,
        tolerance: newQ.tolerance || 0.01,
      }
      setQuestions([...questions, question])
    } else {
      if (!newQ.text?.trim()) { alert('Question text is required'); return }
      if (!newQ.marks || newQ.marks < 1) { alert('Marks must be at least 1'); return }
      if (newQ.type === 'MULTIPLE_CHOICE') {
        const filled = newQ.options?.filter(o => o.text.trim()) || []
        if (filled.length < 2) { alert('MCQ needs at least 2 options'); return }
        if (!newQ.options?.some(o => o.isCorrect)) { alert('Mark the correct answer'); return }
      }
      if (newQ.type === 'DRAWING' && !canvasData) {
        alert('Please draw something on the canvas')
        return
      }

      const question: Question = {
        id: `q_${Date.now()}`,
        type: newQ.type as string,
        text: newQ.text.trim(),
        marks: newQ.marks,
        order: questions.length + 1,
        options: newQ.type === 'MULTIPLE_CHOICE' ? newQ.options?.filter(o => o.text.trim()) : undefined,
        correctAnswer: (newQ.type === 'SHORT_ANSWER' || newQ.type === 'TRUE_FALSE' || newQ.type === 'ESSAY') ? newQ.correctAnswer : undefined,
      }
      if (newQ.type === 'DRAWING') {
        question.text = newQ.text.trim() || 'Draw your answer on the canvas'
      }
      setQuestions([...questions, question])
    }

    // Reset form
    setNewQ({
      type: 'MULTIPLE_CHOICE',
      text: '',
      marks: 5,
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      subQuestions: [],
    })
    setCanvasData('')
    setShowAddQ(false)
  }

  const removeQ = (id: string) => setQuestions(questions.filter(q => q.id !== id))

  const statusBadge = (status: string) => {
    const cfg: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700', SCHEDULED: 'bg-blue-50 text-blue-700',
      ACTIVE: 'bg-green-50 text-green-700', COMPLETED: 'bg-gray-50 text-gray-500',
    }
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg[status] || cfg.DRAFT}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
  }

  const selectedModule = modules.find(m => m.id === form.moduleId)
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0)

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Schedule' },
    { num: 3, label: 'Questions' },
    { num: 4, label: 'Review' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Create New Exam</Button>
      </div>

      {modules.length === 0 && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">No modules assigned</p>
              <p className="text-sm text-amber-700">Contact admin to assign you modules.</p>
            </div>
          </div>
        </Card>
      )}

      {exams.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No exams yet</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Create your first exam</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => {
            const mod = modules.find(m => m.id === exam.moduleId)
            return (
              <Card key={exam.id} className="p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">{exam.title}</h3>
                      {statusBadge(exam.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <span><BookOpen className="w-3.5 h-3.5 inline mr-1" />{mod?.code || exam.module?.code} — {mod?.name || exam.module?.name}</span>
                      <span><Clock className="w-3.5 h-3.5 inline mr-1" />{exam.duration} min</span>
                      <span><ListChecks className="w-3.5 h-3.5 inline mr-1" />{exam.totalMarks} marks</span>
                      <span><Users className="w-3.5 h-3.5 inline mr-1" />{exam._count?.examAttempts || 0} attempts</span>
                      {mod?.class && <span><GraduationCap className="w-3.5 h-3.5 inline mr-1" />{mod.class.name}</span>}
                    </div>
                    {exam.scheduledDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(exam.scheduledDate).toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(exam)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDuplicate(exam)}><Copy className="w-4 h-4" /></Button>
                    {exam.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(exam.id)}><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={v => { if (!v) closeDialog() }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-200 pb-3">
            <DialogTitle className="text-lg font-bold">{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  step === s.num ? 'bg-primary text-white border-primary' :
                  step > s.num ? 'bg-green-50 text-green-700 border-green-300' :
                  'bg-white text-gray-400 border-gray-300'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs ${step === s.num ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{s.label}</span>
                {i < 3 && <div className={`w-6 h-px ${step > s.num ? 'bg-green-300' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-blue-100 bg-blue-50 rounded-lg p-4">
                <Label className="text-sm font-medium text-blue-900">Module <span className="text-red-500">*</span></Label>
                <Select value={form.moduleId} onValueChange={v => setForm({ ...form, moduleId: v })}>
                  <SelectTrigger className="mt-1 bg-white border-blue-200">
                    <SelectValue placeholder="Select your module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.code} — {m.name} ({m.class?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModule?.class && (
                  <p className="text-xs text-blue-700 mt-1">Students: <strong>{selectedModule.class.name}</strong></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Mid Semester</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Duration (min) <span className="text-red-500">*</span></Label>
                  <Input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Total Marks</Label>
                  <Input type="number" min="1" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Passing Marks</Label>
                  <Input type="number" min="1" value={form.passingMarks} onChange={e => setForm({ ...form, passingMarks: e.target.value })} className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm">Instructions</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional instructions..." rows={2} className="mt-1" />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-200">
                <Button onClick={() => setStep(2)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Date & Time</Label>
                  <Input type="datetime-local" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">End Date & Time</Label>
                  <Input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="mt-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showResults} onChange={e => setForm({ ...form, showResults: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm">Show results immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.allowLateSubmission} onChange={e => setForm({ ...form, allowLateSubmission: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm">Allow late submissions</span>
                </label>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
                <Button onClick={() => setStep(3)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{questions.length} questions · {totalMarks} marks</span>
                <Button size="sm" onClick={() => {
                  setShowAddQ(!showAddQ)
                  setNewQ({
                    type: 'MULTIPLE_CHOICE',
                    text: '',
                    marks: 5,
                    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                    subQuestions: [],
                  })
                }}>
                  <Plus className="w-4 h-4 mr-1" />{showAddQ ? 'Cancel' : 'Add Question'}
                </Button>
              </div>

              {showAddQ && (
                <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 bg-primary/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={newQ.type} onValueChange={v => {
                        setNewQ({
                          ...newQ,
                          type: v,
                          options: v === 'MULTIPLE_CHOICE' ? [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] :
                                  v === 'TRUE_FALSE' ? [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }] :
                                  undefined,
                        })
                        setCanvasData(v === 'DRAWING' ? '' : canvasData)
                      }}>
                        <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                          <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                          <SelectItem value="ESSAY">Essay</SelectItem>
                          <SelectItem value="MATH">Math (LaTeX)</SelectItem>
                          <SelectItem value="STRUCTURED">Structured (1a, 1b, 1c)</SelectItem>
                          <SelectItem value="DRAWING">Drawing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">
                        Marks
                        {newQ.type === 'STRUCTURED' && (
                          <span className="text-muted-foreground font-normal ml-1">(auto-summed)</span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={newQ.type === 'STRUCTURED' ? (newQ.subQuestions || []).reduce((s, sq) => s + sq.marks, 0) : (newQ.marks || 0)}
                        onChange={e => {
                          if (newQ.type !== 'STRUCTURED') {
                            setNewQ({ ...newQ, marks: parseInt(e.target.value) || 0 })
                          }
                        }}
                        disabled={newQ.type === 'STRUCTURED'}
                        className="mt-1 h-9"
                      />
                    </div>
                  </div>

                  {/* STRUCTURED question builder */}
                  {newQ.type === 'STRUCTURED' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Question stem (optional):</Label>
                        <Textarea
                          value={newQ.text || ''}
                          onChange={e => setNewQ({ ...newQ, text: e.target.value })}
                          placeholder="e.g., Solve the following equations:"
                          rows={1}
                          className="text-sm mt-1"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-primary flex items-center gap-1">
                          <GripVertical className="w-3.5 h-3.5" />
                          Sub-Questions (1a, 1b, 1c...)
                        </Label>
                        <Button type="button" size="sm" variant="outline" onClick={addSubQuestion} className="h-7 text-xs">
                          <Plus className="w-3 h-3 mr-1" /> Add Part
                        </Button>
                      </div>

                      {(newQ.subQuestions || []).length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            No sub-questions yet. Click "Add Part" to create 1a, 1b, 1c...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {(newQ.subQuestions || []).map((sq, idx) => (
                            <SubQuestionEditor
                              key={sq.id}
                              subQuestion={sq}
                              index={idx}
                              onChange={(updated) => updateSubQuestion(idx, updated)}
                              onRemove={() => removeSubQuestion(idx)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MATH question with MathInput */}
                  {newQ.type === 'MATH' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Question Text:</Label>
                        <MathInput
                          value={newQ.text || ''}
                          onChange={v => setNewQ({ ...newQ, text: v })}
                          placeholder="Enter question with LaTeX (e.g., Solve $\int_{0}^{\infty} e^{-x} dx$)"
                          label="Question"
                          showSolve={false}
                        />
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                          Expected Answer (for auto-marking):
                        </Label>
                        <MathInput
                          value={newQ.mathAnswer || ''}
                          onChange={v => setNewQ({ ...newQ, mathAnswer: v })}
                          placeholder="e.g., \frac{1}{2}"
                          label="Correct Answer"
                          showSolve={false}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Label className="text-xs text-muted-foreground">Tolerance:</Label>
                          <Input
                            type="number"
                            min={0}
                            step={0.001}
                            value={newQ.tolerance ?? 0.01}
                            onChange={e => setNewQ({ ...newQ, tolerance: parseFloat(e.target.value) || 0.01 })}
                            className="h-8 w-24 text-xs"
                          />
                          <span className="text-[10px] text-muted-foreground">(numerical tolerance for auto-marking)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TRUE_FALSE question */}
                  {newQ.type === 'TRUE_FALSE' && (
                    <div className="space-y-2">
                      <Textarea
                        value={newQ.text || ''}
                        onChange={e => setNewQ({ ...newQ, text: e.target.value })}
                        placeholder="Enter your true/false question..."
                        rows={2}
                        className="mt-1"
                      />
                      <div className="flex items-center gap-3">
                        <Label className="text-xs">Correct Answer:</Label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewQ({ ...newQ, correctAnswer: 'true' })}
                            className={`px-3 py-1 text-xs rounded border ${
                              newQ.correctAnswer === 'true'
                                ? 'bg-green-100 border-green-400 text-green-700'
                                : 'bg-white border-gray-200 text-gray-500'
                            }`}
                          >
                            True
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewQ({ ...newQ, correctAnswer: 'false' })}
                            className={`px-3 py-1 text-xs rounded border ${
                              newQ.correctAnswer === 'false'
                                ? 'bg-green-100 border-green-400 text-green-700'
                                : 'bg-white border-gray-200 text-gray-500'
                            }`}
                          >
                            False
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DRAWING question */}
                  {newQ.type === 'DRAWING' && (
                    <div className="space-y-2">
                      <Textarea
                        value={newQ.text || ''}
                        onChange={e => setNewQ({ ...newQ, text: e.target.value })}
                        placeholder="Optional: instructions for the drawing question"
                        rows={1}
                        className="mt-1"
                      />
                      <DrawingCanvas value={canvasData} onChange={setCanvasData} />
                      {canvasData && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600">Canvas drawing saved</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other question types */}
                  {newQ.type !== 'MATH' && newQ.type !== 'STRUCTURED' && newQ.type !== 'TRUE_FALSE' && newQ.type !== 'DRAWING' && (
                    <>
                      <Textarea value={newQ.text} onChange={e => setNewQ({ ...newQ, text: e.target.value })} placeholder="Enter question..." rows={2} className="mt-1" />

                      {newQ.type === 'MULTIPLE_CHOICE' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Options</Label>
                          {newQ.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="radio" name="mcq" checked={opt.isCorrect}
                                onChange={() => setNewQ({ ...newQ, options: newQ.options?.map((o, j) => ({ ...o, isCorrect: j === i })) })}
                                className="w-4 h-4 accent-primary shrink-0" />
                              <Input value={opt.text} onChange={e => {
                                const opts = [...(newQ.options || [])]; opts[i] = { ...opts[i], text: e.target.value }; setNewQ({ ...newQ, options: opts })
                              }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 h-9" />
                              {newQ.options && newQ.options.length > 2 && (
                                <button onClick={() => setNewQ({ ...newQ, options: newQ.options?.filter((_, j) => j !== i) })} className="text-red-500 text-xs">X</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => setNewQ({ ...newQ, options: [...(newQ.options || []), { text: '', isCorrect: false }] })} className="text-xs text-primary font-medium">+ Add option</button>
                        </div>
                      )}

                      {newQ.type === 'SHORT_ANSWER' && (
                        <div>
                          <Label className="text-xs">Expected Answer</Label>
                          <Input
                            value={newQ.correctAnswer || ''}
                            onChange={e => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                            placeholder="Expected answer for semi-automatic marking"
                            className="h-9"
                          />
                        </div>
                      )}

                      {newQ.type === 'ESSAY' && (
                        <div>
                          <Label className="text-xs">Marking Guidelines</Label>
                          <Textarea
                            value={newQ.correctAnswer || ''}
                            onChange={e => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                            placeholder="Optional: guidelines for manual marking"
                            rows={2}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-end"><Button size="sm" onClick={addQuestion}>Add Question</Button></div>
                </div>
              )}

              {questions.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  <ListChecks className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No questions yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {questions.map((q, i) => (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <Badge variant="secondary" className="text-xs">
                            {q.type === 'MULTIPLE_CHOICE' ? 'MCQ' :
                             q.type === 'SHORT_ANSWER' ? 'Short' :
                             q.type === 'TRUE_FALSE' ? 'T/F' :
                             q.type === 'ESSAY' ? 'Essay' :
                             q.type === 'MATH' ? 'Math' :
                             q.type === 'STRUCTURED' ? 'Structured' :
                             q.type === 'DRAWING' ? 'Drawing' : q.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{q.marks} marks</span>
                          {q.type === 'STRUCTURED' && q.subQuestions && (
                            <span className="text-[10px] text-muted-foreground">
                              ({q.subQuestions.length} parts)
                            </span>
                          )}
                        </div>
                        <p className="text-sm truncate">{q.text}</p>
                        {q.type === 'STRUCTURED' && q.subQuestions && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {q.subQuestions.map((sq, sIdx) => (
                              <Badge key={sq.id} variant="outline" className="text-[10px] bg-gray-50">
                                {sIdx + 1}a ({sq.category}) - {sq.marks}mk
                              </Badge>
                            ))}
                          </div>
                        )}
                        {q.mathAnswer && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-muted-foreground font-mono">Ans: {q.mathAnswer.substring(0, 30)}{q.mathAnswer.length > 30 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 shrink-0" onClick={() => removeQ(q.id)}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
                <Button onClick={() => setStep(4)}>Review <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-500">Module:</span> <span className="font-medium">{selectedModule?.code}</span></div>
                  <div><span className="text-gray-500">Class:</span> <span className="font-medium">{selectedModule?.class?.name || '-'}</span></div>
                  <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{form.type}</span></div>
                  <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{form.duration} min</span></div>
                  <div><span className="text-gray-500">Questions:</span> <span className="font-medium">{questions.length}</span></div>
                  <div><span className="text-gray-500">Marks:</span> <span className="font-medium">{form.totalMarks}</span></div>
                </div>
                {form.scheduledDate && <p className="text-gray-500 pt-2 border-t border-gray-200 mt-2"><Calendar className="w-3.5 h-3.5 inline mr-1" />{new Date(form.scheduledDate).toLocaleString()}</p>}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-800">Only students in <strong>{selectedModule?.class?.name}</strong> will see this exam</p>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSubmit(false)} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}Draft
                  </Button>
                  <Button onClick={() => handleSubmit(true)} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                    {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}Publish
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}