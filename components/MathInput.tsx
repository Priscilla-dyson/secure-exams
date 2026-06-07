'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Sigma, ChevronDown, ChevronUp, Copy, Check, Play, Table2, Plus, Minus, X, Maximize2, Minimize2 } from 'lucide-react'

// KaTeX CSS import
import 'katex/dist/katex.min.css'

interface MathResult {
  success: boolean
  input: string
  result?: string
  result_text?: string
  steps?: string[]
  solutions?: string[]
  variable?: string
  error?: string
}

// LaTeX symbol palette with rendering metadata
interface SymbolDef {
  label: string
  latex: string
  group: string
  renderLatex: string  // LaTeX string that actually renders nicely
}

const LATEX_SYMBOLS: SymbolDef[] = [
  // Fractions
  { label: '\\frac{a}{b}', latex: '\\frac{a}{b}', group: 'fractions', renderLatex: '\\frac{a}{b}' },
  { label: '\\frac{dy}{dx}', latex: '\\frac{dy}{dx}', group: 'fractions', renderLatex: '\\frac{dy}{dx}' },
  
  // Powers & Roots
  { label: 'x^n', latex: 'x^{n}', group: 'powers', renderLatex: 'x^{n}' },
  { label: 'x^{1/2}', latex: 'x^{\\frac{1}{2}}', group: 'powers', renderLatex: 'x^{\\frac{1}{2}}' },
  { label: 'e^x', latex: 'e^{x}', group: 'powers', renderLatex: 'e^{x}' },
  { label: '\\sqrt{x}', latex: '\\sqrt{x}', group: 'roots', renderLatex: '\\sqrt{x}' },
  { label: '\\sqrt[n]{x}', latex: '\\sqrt[n]{x}', group: 'roots', renderLatex: '\\sqrt[3]{x}' },

  // Calculus
  { label: '\\int', latex: '\\int', group: 'calculus', renderLatex: '\\int' },
  { label: '\\int_a^b', latex: '\\int_{a}^{b}', group: 'calculus', renderLatex: '\\int_{a}^{b}' },
  { label: '\\sum', latex: '\\sum', group: 'calculus', renderLatex: '\\sum' },
  { label: '\\sum_{n=1}^{\\infty}', latex: '\\sum_{n=1}^{\\infty}', group: 'calculus', renderLatex: '\\sum_{n=1}^{\\infty}' },
  { label: '\\prod', latex: '\\prod', group: 'calculus', renderLatex: '\\prod' },
  { label: '\\lim', latex: '\\lim_{x \\to \\infty}', group: 'calculus', renderLatex: '\\lim_{x \\to \\infty}' },

  // Greek
  { label: 'α', latex: '\\alpha', group: 'greek', renderLatex: '\\alpha' },
  { label: 'β', latex: '\\beta', group: 'greek', renderLatex: '\\beta' },
  { label: 'θ', latex: '\\theta', group: 'greek', renderLatex: '\\theta' },
  { label: 'θ²', latex: '\\theta^2', group: 'greek', renderLatex: '\\theta^2' },
  { label: 'π', latex: '\\pi', group: 'greek', renderLatex: '\\pi' },
  { label: 'Δ', latex: '\\Delta', group: 'greek', renderLatex: '\\Delta' },
  { label: 'λ', latex: '\\lambda', group: 'greek', renderLatex: '\\lambda' },
  { label: 'μ', latex: '\\mu', group: 'greek', renderLatex: '\\mu' },

  // Relations
  { label: '=', latex: '=', group: 'relations', renderLatex: '=' },
  { label: '≠', latex: '\\neq', group: 'relations', renderLatex: '\\neq' },
  { label: '≈', latex: '\\approx', group: 'relations', renderLatex: '\\approx' },
  { label: '<', latex: '<', group: 'relations', renderLatex: '<' },
  { label: '>', latex: '>', group: 'relations', renderLatex: '>' },
  { label: '≤', latex: '\\leq', group: 'relations', renderLatex: '\\leq' },
  { label: '≥', latex: '\\geq', group: 'relations', renderLatex: '\\geq' },
  { label: '≡', latex: '\\equiv', group: 'relations', renderLatex: '\\equiv' },
  { label: '∝', latex: '\\propto', group: 'relations', renderLatex: '\\propto' },

  // Operators
  { label: '×', latex: '\\times', group: 'operators', renderLatex: '\\times' },
  { label: '÷', latex: '\\div', group: 'operators', renderLatex: '\\div' },
  { label: '±', latex: '\\pm', group: 'operators', renderLatex: '\\pm' },
  { label: '∓', latex: '\\mp', group: 'operators', renderLatex: '\\mp' },
  { label: '·', latex: '\\cdot', group: 'operators', renderLatex: '\\cdot' },
  { label: '∘', latex: '\\circ', group: 'operators', renderLatex: '\\circ' },

  // Arrows
  { label: '→', latex: '\\rightarrow', group: 'arrows', renderLatex: '\\rightarrow' },
  { label: '⇒', latex: '\\Rightarrow', group: 'arrows', renderLatex: '\\Rightarrow' },
  { label: '↔', latex: '\\leftrightarrow', group: 'arrows', renderLatex: '\\leftrightarrow' },
  { label: '⇔', latex: '\\Leftrightarrow', group: 'arrows', renderLatex: '\\Leftrightarrow' },
  { label: '↦', latex: '\\mapsto', group: 'arrows', renderLatex: '\\mapsto' },

  // Set Theory
  { label: '∪', latex: '\\cup', group: 'sets', renderLatex: '\\cup' },
  { label: '∩', latex: '\\cap', group: 'sets', renderLatex: '\\cap' },
  { label: '⊂', latex: '\\subset', group: 'sets', renderLatex: '\\subset' },
  { label: '⊆', latex: '\\subseteq', group: 'sets', renderLatex: '\\subseteq' },
  { label: '∈', latex: '\\in', group: 'sets', renderLatex: '\\in' },
  { label: '∉', latex: '\\notin', group: 'sets', renderLatex: '\\notin' },
  { label: '∅', latex: '\\emptyset', group: 'sets', renderLatex: '\\emptyset' },
  { label: '∀', latex: '\\forall', group: 'sets', renderLatex: '\\forall' },
  { label: '∃', latex: '\\exists', group: 'sets', renderLatex: '\\exists' },

  // Matrices
  { label: 'Matrix (2×2)', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', group: 'matrices', renderLatex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
  { label: 'Matrix (3×3)', latex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}', group: 'matrices', renderLatex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}' },
  { label: 'Pmatrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', group: 'matrices', renderLatex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Cases', latex: '\\begin{cases} x & y \\\\ z & w \\end{cases}', group: 'matrices', renderLatex: '\\begin{cases} x & y \\\\ z & w \\end{cases}' },
]

const GROUPS = [
  { id: 'fractions', label: 'Fractions' },
  { id: 'powers', label: 'Powers' },
  { id: 'roots', label: 'Roots' },
  { id: 'calculus', label: 'Calculus' },
  { id: 'greek', label: 'Greek' },
  { id: 'relations', label: 'Relations' },
  { id: 'operators', label: 'Operators' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'sets', label: 'Sets' },
  { id: 'matrices', label: 'Matrices' },
]

interface MathInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  showSolve?: boolean
  readOnly?: boolean
  maxLength?: number
}

/**
 * Renders LaTeX to HTML synchronously using KaTeX.
 * Falls back to a styled error span on failure.
 */
function renderLatexSync(latex: string, displayMode = false): string {
  try {
    // Dynamic import won't work sync — we try a pre-loaded reference
    // This works because katex is imported at module level via CSS
    const katex = (window as any).katex
    if (katex) {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode,
        output: 'html'
      })
    }
    return `<span class="text-muted-foreground">${latex}</span>`
  } catch {
    return `<span class="text-red-500">${latex}</span>`
  }
}

/**
 * Pre-rendered palette button — renders KaTeX statically at mount time.
 */
function PaletteButton({ symbol, onClick }: { symbol: SymbolDef; onClick: () => void }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const katex = await import('katex')
        if (cancelled) return
        const rendered = katex.default.renderToString(symbol.renderLatex, {
          throwOnError: false,
          displayMode: false,
          output: 'html'
        })
        setHtml(rendered)
      } catch {
        if (!cancelled) setHtml(`<span class="text-muted-foreground text-xs">${symbol.label}</span>`)
      }
    }
    render()
    return () => { cancelled = true }
  }, [symbol.renderLatex, symbol.label])

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-14 h-10 flex items-center justify-center bg-background border border-border rounded-md hover:bg-primary/10 hover:border-primary/40 transition-colors"
      title={`Insert: ${symbol.latex}`}
    >
      <span
        className="katex-inline [&_.katex]:text-base"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </button>
  )
}

/**
 * Matrix editor helper — lets users define matrix dimensions and fills cells.
 */
function MatrixEditor({ onInsert }: { onInsert: (latex: string) => void }) {
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(2)
  const [cells, setCells] = useState<string[][]>(() =>
    Array.from({ length: 2 }, () => Array(2).fill(''))
  )

  const updateCell = (r: number, c: number, val: string) => {
    const next = cells.map(row => [...row])
    next[r][c] = val
    setCells(next)
  }

  const resize = (newRows: number, newCols: number) => {
    const clampedRows = Math.max(1, Math.min(5, newRows))
    const clampedCols = Math.max(1, Math.min(5, newCols))
    setRows(clampedRows)
    setCols(clampedCols)
    setCells(prev =>
      Array.from({ length: clampedRows }, (_, r) =>
        Array.from({ length: clampedCols }, (_, c) =>
          prev[r]?.[c] ?? ''
        )
      )
    )
  }

  const generateMatrix = () => {
    const rowsLatex = cells
      .map(row => row.join(' & '))
      .join(' \\\\ ')
    const latex = `\\begin{bmatrix} ${rowsLatex} \\end{bmatrix}`
    onInsert(latex)
  }

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Label className="text-xs">Rows:</Label>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => resize(rows - 1, cols)}
              disabled={rows <= 1}
              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono w-4 text-center">{rows}</span>
            <button
              type="button"
              onClick={() => resize(rows + 1, cols)}
              disabled={rows >= 5}
              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs">Cols:</Label>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => resize(rows, cols - 1)}
              disabled={cols <= 1}
              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono w-4 text-center">{cols}</span>
            <button
              type="button"
              onClick={() => resize(rows, cols + 1)}
              disabled={cols >= 5}
              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={generateMatrix} className="ml-auto h-7 text-xs">
          <Table2 className="w-3 h-3 mr-1" />
          Insert Matrix
        </Button>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((row, r) =>
          row.map((cell, c) => (
            <Input
              key={`${r}-${c}`}
              value={cell}
              onChange={e => updateCell(r, c, e.target.value)}
              className="h-8 text-xs font-mono text-center px-1"
              placeholder={`${String.fromCharCode(97 + r + c)}`}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function MathInput({
  value,
  onChange,
  placeholder = 'Enter mathematical expression (LaTeX)',
  label = 'Mathematical Expression',
  showSolve = true,
  readOnly = false,
  maxLength
}: MathInputProps) {
  const [activeGroup, setActiveGroup] = useState('fractions')
  const [result, setResult] = useState<MathResult | null>(null)
  const [computing, setComputing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [operation, setOperation] = useState('simplify')
  const [showPalette, setShowPalette] = useState(true)
  const [copied, setCopied] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState<Record<string, string>>({})
  const [showMatrixEditor, setShowMatrixEditor] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Render LaTeX with KaTeX
  const renderLatex = useCallback(async (latex: string, displayMode = true): Promise<string> => {
    try {
      const katex = await import('katex')
      return katex.default.renderToString(latex, {
        throwOnError: false,
        displayMode,
        output: 'html'
      })
    } catch {
      return `<span class="text-red-500">LaTeX Error: ${latex}</span>`
    }
  }, [])

  // Render preview
  useEffect(() => {
    if (!value.trim()) {
      setRenderedHtml(prev => ({ ...prev, preview: '' }))
      return
    }
    const renderPreview = async () => {
      const html = await renderLatex(value)
      setRenderedHtml(prev => ({ ...prev, preview: html }))
    }
    renderPreview()
  }, [value, renderLatex])

  // Render result
  useEffect(() => {
    if (!result) return

    const renderAll = async () => {
      const rendered: Record<string, string> = {}

      // Render main result
      if (result.result) {
        rendered['result'] = await renderLatex(result.result)
      }

      // Render solutions
      if (result.solutions) {
        for (let i = 0; i < result.solutions.length; i++) {
          rendered[`sol_${i}`] = await renderLatex(result.solutions[i])
        }
      }

      // Render steps with LaTeX extraction
      if (result.steps) {
        for (let i = 0; i < result.steps.length; i++) {
          const step = result.steps[i]
          const latexMatches = step.match(/\$(.+?)\$/g)
          if (latexMatches) {
            let renderedStep = step
            for (const match of latexMatches) {
              const latex = match.slice(1, -1)
              try {
                const html = await renderLatex(latex)
                renderedStep = renderedStep.replace(match, html)
              } catch {
                // keep original
              }
            }
            rendered[`step_${i}`] = renderedStep
          } else {
            rendered[`step_${i}`] = step
          }
        }
      }

      setRenderedHtml(prev => ({ ...prev, ...rendered }))
    }
    renderAll()
  }, [result, renderLatex])

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

  const handleCompute = async () => {
    if (!value.trim()) return
    setComputing(true)
    setShowResult(true)

    try {
      const res = await fetch('/api/math/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          expression: value.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        setResult({
          success: true,
          input: data.input,
          result: data.result,
          result_text: data.result_text,
          steps: data.steps,
          solutions: data.solutions,
          variable: data.variable
        })
      } else {
        setResult({
          success: false,
          input: value,
          error: data.error || 'Computation failed'
        })
      }
    } catch {
      setResult({
        success: false,
        input: value,
        error: 'Failed to connect to math service'
      })
    } finally {
      setComputing(false)
    }
  }

  const handleCopyResult = async () => {
    if (result?.result) {
      await navigator.clipboard.writeText(result.result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab to insert spaces for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = value.substring(0, start)
        const after = value.substring(end)
        onChange(before + '  ' + after)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  return (
    <div className={`space-y-3 ${fullscreen ? 'fixed inset-4 z-50 bg-background border border-border rounded-xl shadow-2xl p-6 overflow-auto' : ''}`}>
      {/* Label & Controls */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Sigma className="w-4 h-4 text-primary" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFullscreen(!fullscreen)}
            className="text-xs text-muted-foreground hover:text-foreground"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setShowPalette(!showPalette)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {showPalette ? 'Hide Palette' : 'Show Palette'}
            {showPalette ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* LaTeX Palette */}
      {showPalette && (
        <Card className="border border-border/50 bg-muted/30">
          <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
            <TabsList className="flex-wrap h-auto gap-0.5 bg-muted/50 p-1 rounded-t-lg border-b border-border/50">
              {GROUPS.map(g => (
                <TabsTrigger key={g.id} value={g.id} className="text-xs px-2 py-0.5 h-6">
                  {g.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {GROUPS.map(g => (
              <TabsContent key={g.id} value={g.id} className="p-2 m-0">
                {g.id === 'matrices' ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {LATEX_SYMBOLS.filter(s => s.group === g.id).map((sym, i) => (
                        <PaletteButton key={i} symbol={sym} onClick={() => insertLatex(sym.latex)} />
                      ))}
                    </div>
                    <div className="border-t border-border/50 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowMatrixEditor(!showMatrixEditor)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        <Table2 className="w-3 h-3" />
                        {showMatrixEditor ? 'Hide Matrix Builder' : 'Open Matrix Builder'}
                      </button>
                      {showMatrixEditor && (
                        <MatrixEditor onInsert={(latex) => {
                          insertLatex(latex)
                          setShowMatrixEditor(false)
                        }} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {LATEX_SYMBOLS.filter(s => s.group === g.id).map((sym, i) => (
                      <PaletteButton key={i} symbol={sym} onClick={() => insertLatex(sym.latex)} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}

      {/* Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id="math-input-textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={fullscreen ? 8 : 3}
          className="font-mono text-sm resize-y"
          readOnly={readOnly}
          maxLength={maxLength}
        />
        {/* Quick-action toolbar below input */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {showSolve && (
              <>
                <select
                  value={operation}
                  onChange={e => setOperation(e.target.value)}
                  className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium"
                >
                  <option value="simplify">Simplify</option>
                  <option value="solve">Solve</option>
                  <option value="derive">Differentiate</option>
                  <option value="integrate">Integrate</option>
                  <option value="evaluate">Evaluate</option>
                </select>
                <Button size="sm" variant="default" onClick={handleCompute} disabled={computing || !value.trim()} className="h-7 text-xs">
                  {computing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 mr-1" />
                  )}
                  Compute
                </Button>
              </>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            LaTeX mode
          </span>
        </div>
      </div>

      {/* Live Preview */}
      {value.trim() && (
        <Card className="border border-border/50 rounded-lg p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Preview:</p>
          </div>
          <div
            className="math-preview text-lg py-3 px-2 bg-muted/20 rounded-md overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderedHtml.preview || '' }}
          />
        </Card>
      )}

      {/* Result */}
      {showResult && result && (
        <Card className={`border-2 p-4 ${
          result.success
            ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
            : 'border-red-300 bg-red-50/50 dark:bg-red-950/20'
        }`}>
          {result.success ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wider">
                    {operation === 'simplify' ? '✓ Simplified Result' :
                     operation === 'solve' ? '✓ Solutions' :
                     operation === 'derive' ? `✓ Derivative ${result.variable ? `w.r.t. ${result.variable}` : ''}` :
                     operation === 'integrate' ? `✓ Integral ${result.variable ? `w.r.t. ${result.variable}` : ''}` :
                     '✓ Result'}
                  </p>
                  {operation === 'solve' && result.solutions ? (
                    <div className="space-y-1">
                      {result.solutions.map((sol, i) => (
                        <div
                          key={i}
                          className="text-lg font-mono bg-white dark:bg-background rounded p-2 border border-green-200"
                          dangerouslySetInnerHTML={{ __html: renderedHtml[`sol_${i}`] || '' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-lg font-mono bg-white dark:bg-background rounded p-3 border border-green-200 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: renderedHtml['result'] || '' }}
                    />
                  )}
                  {result.result_text && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 rounded p-1.5">
                      {result.result_text}
                    </p>
                  )}
                </div>
                {result.result && (
                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-background rounded transition shrink-0"
                    title="Copy result"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Step-by-step */}
              {result.steps && result.steps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Step-by-step solution:
                  </p>
                  <div className="space-y-2">
                    {result.steps.map((step, i) => (
                      <div key={i} className="text-sm flex gap-3 p-2 rounded bg-white/50 dark:bg-background/50">
                        <span className="text-green-600 dark:text-green-400 font-bold shrink-0 text-xs mt-0.5">
                          {i + 1}.
                        </span>
                        <div
                          className="math-step flex-1"
                          dangerouslySetInnerHTML={{ __html: renderedHtml[`step_${i}`] || step }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                  Computation Error
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">{result.error}</p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// Simple inline math renderer component
export function InlineMath({ latex }: { latex: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const katex = await import('katex')
        if (cancelled) return
        const rendered = katex.default.renderToString(latex, {
          throwOnError: false,
          displayMode: false,
          output: 'html'
        })
        setHtml(rendered)
      } catch {
        if (!cancelled) setHtml(`<span class="text-red-400">${latex}</span>`)
      }
    }
    render()
    return () => { cancelled = true }
  }, [latex])

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// Display math renderer
export function DisplayMath({ latex }: { latex: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const katex = await import('katex')
        if (cancelled) return
        const rendered = katex.default.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
          output: 'html'
        })
        setHtml(rendered)
      } catch {
        if (!cancelled) setHtml(`<span class="text-red-400">${latex}</span>`)
      }
    }
    render()
    return () => { cancelled = true }
  }, [latex])

  return <div className="math-display my-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
}