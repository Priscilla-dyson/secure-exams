/**
 * Auto-Marking Service
 * 
 * Handles automatic marking for different question categories:
 * - MULTIPLE_CHOICE: Compare selected option with correct answer
 * - TRUE_FALSE: Compare boolean answer
 * - SHORT_ANSWER: Fuzzy string matching with keywords
 * - MATH: SymPy mathematical expression comparison (via Python service)
 * - STRUCTURED: Aggregate marks from sub-questions
 * - ESSAY: Manual only (requiresManualMarking = true)
 */

interface MarkingResult {
  score: number          // Score achieved (0 to maxMarks)
  maxMarks: number       // Total marks available
  percentage: number     // 0 to 100
  autoMarked: boolean
  isCorrect: boolean | null
  confidence: number     // 0.0 to 1.0
  details: MarkingDetail[]
}

interface MarkingDetail {
  type: string
  message: string
  passed?: boolean
  value?: any
}

interface MarkingConfig {
  marks: number
  caseSensitive?: boolean
  maxLength?: number
  tolerance?: number
  keywords?: string[]
  requiredWords?: string[]
  minWords?: number
}

/**
 * Marks a multiple choice question
 */
export function markMultipleChoice(
  selectedOptionId: string | null,
  correctOptions: { id: string; text: string; isCorrect: boolean }[],
  maxMarks: number
): MarkingResult {
  if (!selectedOptionId) {
    return {
      score: 0,
      maxMarks,
      percentage: 0,
      autoMarked: true,
      isCorrect: false,
      confidence: 1.0,
      details: [{ type: 'error', message: 'No answer selected' }]
    }
  }

  const selected = correctOptions.find(o => o.id === selectedOptionId)
  if (!selected) {
    return {
      score: 0,
      maxMarks,
      percentage: 0,
      autoMarked: true,
      isCorrect: false,
      confidence: 1.0,
      details: [{ type: 'error', message: 'Selected option not found' }]
    }
  }

  const isCorrect = selected.isCorrect
  return {
    score: isCorrect ? maxMarks : 0,
    maxMarks,
    percentage: isCorrect ? 100 : 0,
    autoMarked: true,
    isCorrect,
    confidence: 1.0,
    details: [{
      type: isCorrect ? 'success' : 'failure',
      message: isCorrect 
        ? `Correct answer selected: "${selected.text}"`
        : `Incorrect answer selected: "${selected.text}"`,
      passed: isCorrect,
      value: selected.text
    }]
  }
}

/**
 * Marks a true/false question
 */
export function markTrueFalse(
  studentAnswer: boolean | null,
  correctAnswer: boolean,
  maxMarks: number
): MarkingResult {
  if (studentAnswer === null || studentAnswer === undefined) {
    return {
      score: 0,
      maxMarks,
      percentage: 0,
      autoMarked: true,
      isCorrect: false,
      confidence: 1.0,
      details: [{ type: 'error', message: 'No answer provided' }]
    }
  }

  const isCorrect = studentAnswer === correctAnswer
  return {
    score: isCorrect ? maxMarks : 0,
    maxMarks,
    percentage: isCorrect ? 100 : 0,
    autoMarked: true,
    isCorrect,
    confidence: 1.0,
    details: [{
      type: isCorrect ? 'success' : 'failure',
      message: isCorrect
        ? `Correct (${studentAnswer ? 'True' : 'False'})`
        : `Incorrect. Expected: ${correctAnswer ? 'True' : 'False'}, Got: ${studentAnswer ? 'True' : 'False'}`,
      passed: isCorrect,
      value: studentAnswer
    }]
  }
}

/**
 * Marks a short answer question using fuzzy matching
 */
export function markShortAnswer(
  studentAnswer: string | null,
  correctAnswer: string,
  config: MarkingConfig
): MarkingResult {
  if (!studentAnswer || !studentAnswer.trim()) {
    return {
      score: 0,
      maxMarks: config.marks,
      percentage: 0,
      autoMarked: true,
      isCorrect: false,
      confidence: 1.0,
      details: [{ type: 'error', message: 'No answer provided' }]
    }
  }

  const details: MarkingDetail[] = []
  let totalScore = 0
  let checksPassed = 0
  let totalChecks = 0

  const student = config.caseSensitive ? studentAnswer.trim() : studentAnswer.trim().toLowerCase()
  const expected = config.caseSensitive ? correctAnswer.trim() : correctAnswer.trim().toLowerCase()

  // Check 1: Length constraint
  if (config.maxLength && config.maxLength > 0) {
    totalChecks++
    if (studentAnswer.length <= config.maxLength) {
      checksPassed++
      details.push({
        type: 'success',
        message: `Length (${studentAnswer.length} chars) within limit of ${config.maxLength}`,
        passed: true
      })
    } else {
      details.push({
        type: 'failure',
        message: `Length (${studentAnswer.length} chars) exceeds limit of ${config.maxLength}`,
        passed: false
      })
    }
  }

  // Check 2: Exact match (for simple answers)
  if (student === expected) {
    totalScore = config.marks
    details.push({
      type: 'success',
      message: 'Exact match with expected answer',
      passed: true
    })
    return {
      score: totalScore,
      maxMarks: config.marks,
      percentage: 100,
      autoMarked: true,
      isCorrect: true,
      confidence: 1.0,
      details
    }
  }

  // Check 3: Keyword matching
  if (config.keywords && config.keywords.length > 0) {
    totalChecks += config.keywords.length
    for (const keyword of config.keywords) {
      const kw = config.caseSensitive ? keyword : keyword.toLowerCase()
      if (student.includes(kw)) {
        checksPassed++
        details.push({
          type: 'success',
          message: `Keyword found: "${keyword}"`,
          passed: true
        })
      } else {
        details.push({
          type: 'warning',
          message: `Keyword missing: "${keyword}"`,
          passed: false
        })
      }
    }
  }

  // Check 4: Required words
  if (config.requiredWords && config.requiredWords.length > 0) {
    totalChecks += config.requiredWords.length
    for (const word of config.requiredWords) {
      const w = config.caseSensitive ? word : word.toLowerCase()
      if (student.includes(w)) {
        checksPassed++
        details.push({
          type: 'success',
          message: `Required word found: "${word}"`,
          passed: true
        })
      } else {
        details.push({
          type: 'failure',
          message: `Required word missing: "${word}"`,
          passed: false
        })
      }
    }
  }

  // Check 5: Word count
  if (config.minWords && config.minWords > 0) {
    totalChecks++
    const wordCount = studentAnswer.trim().split(/\s+/).length
    if (wordCount >= config.minWords) {
      checksPassed++
      details.push({
        type: 'success',
        message: `Word count (${wordCount}) meets minimum of ${config.minWords}`,
        passed: true
      })
    } else {
      details.push({
        type: 'failure',
        message: `Word count (${wordCount}) below minimum of ${config.minWords}`,
        passed: false
      })
    }
  }

  // Calculate partial score if no exact match
  if (totalChecks > 0) {
    const partialPercentage = checksPassed / totalChecks
    totalScore = Math.round(config.marks * partialPercentage)
  }

  const isCorrect = totalScore >= config.marks * 0.7 // 70% threshold
  const confidence = totalChecks > 0 ? checksPassed / totalChecks : 0.5

  return {
    score: totalScore,
    maxMarks: config.marks,
    percentage: (totalScore / config.marks) * 100,
    autoMarked: true,
    isCorrect,
    confidence,
    details
  }
}

/**
 * Marks a math question using SymPy comparison via Python subprocess.
 * Calls the Python math_service.py synchronously for real auto-marking.
 */
export function markMathQuestion(
  studentAnswer: string | null,
  correctAnswer: string | null,
  tolerance: number = 0.01,
  maxMarks: number
): MarkingResult {
  if (!studentAnswer || !correctAnswer) {
    return {
      score: 0,
      maxMarks,
      percentage: 0,
      autoMarked: false,
      isCorrect: null,
      confidence: 0,
      details: [{
        type: 'warning',
        message: 'No answer or correct answer provided',
        passed: false
      }]
    }
  }

  // Try SymPy comparison via Python subprocess for proper math equivalence checking
  try {
    const { spawnSync } = require('child_process')
    const path = require('path')
    
    const mathServicePath = path.join(process.cwd(), 'services', 'math_service.py')
    const result = spawnSync('python', [
      mathServicePath,
      'compare',
      studentAnswer,
      correctAnswer,
      String(tolerance)
    ], {
      timeout: 10000,
      encoding: 'utf-8'
    })

    if (result.status === 0 && result.stdout) {
      const parsed = JSON.parse(result.stdout.trim())
      
      if (parsed.correct) {
        return {
          score: maxMarks,
          maxMarks,
          percentage: 100,
          autoMarked: true,
          isCorrect: true,
          confidence: parsed.confidence || 1.0,
          details: [
            {
              type: 'success',
              message: `Mathematically equivalent (confidence: ${((parsed.confidence || 1.0) * 100).toFixed(0)}%)`,
              passed: true
            },
            ...(parsed.details || []).map((d: any) => ({
              type: 'info' as const,
              message: typeof d === 'string' ? d : (d.message || JSON.stringify(d)),
              passed: true
            }))
          ]
        }
      }

      // Partial marks based on confidence
      const confidence = parsed.confidence || 0
      const partialScore = Math.round(maxMarks * confidence)

      return {
        score: partialScore,
        maxMarks,
        percentage: (partialScore / maxMarks) * 100,
        autoMarked: true,
        isCorrect: confidence > 0.8,
        confidence,
        details: [
          {
            type: confidence > 0.5 ? 'warning' : 'failure',
            message: `Not fully equivalent (confidence: ${(confidence * 100).toFixed(0)}%)`,
            passed: confidence > 0.8
          },
          ...(parsed.details || []).map((d: any) => ({
            type: 'info' as const,
            message: typeof d === 'string' ? d : (d.message || JSON.stringify(d)),
            passed: false
          }))
        ]
      }
    }
  } catch (err) {
    // Fall through to basic string comparison if SymPy fails
    console.error('SymPy comparison failed, falling back to string match:', err)
  }

  // Fallback: Basic LaTeX string comparison
  const cleanStudent = studentAnswer.replace(/\s+/g, '').toLowerCase()
  const cleanCorrect = correctAnswer.replace(/\s+/g, '').toLowerCase()

  if (cleanStudent === cleanCorrect) {
    return {
      score: maxMarks,
      maxMarks,
      percentage: 100,
      autoMarked: true,
      isCorrect: true,
      confidence: 1.0,
      details: [{
        type: 'success',
        message: 'LaTeX expression matches exactly',
        passed: true
      }]
    }
  }

  return {
    score: 0,
    maxMarks,
    percentage: 0,
    autoMarked: false,
    isCorrect: null,
    confidence: 0,
    details: [{
      type: 'info',
      message: 'Math answer comparison requires server-side SymPy evaluation.',
      passed: false
    }]
  }
}

/**
 * Aggregates marks from sub-questions for STRUCTURED questions
 */
export function aggregateSubQuestionMarks(
  subResults: MarkingResult[]
): MarkingResult {
  const totalScore = subResults.reduce((sum, r) => sum + r.score, 0)
  const totalMarks = subResults.reduce((sum, r) => sum + r.maxMarks, 0)
  const isCorrect = subResults.every(r => r.isCorrect !== false)
  const avgConfidence = subResults.length > 0 
    ? subResults.reduce((sum, r) => sum + r.confidence, 0) / subResults.length
    : 0

  return {
    score: totalScore,
    maxMarks: totalMarks,
    percentage: totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0,
    autoMarked: subResults.every(r => r.autoMarked),
    isCorrect,
    confidence: avgConfidence,
    details: subResults.flatMap(r => r.details)
  }
}

/**
 * Determines if a question can be auto-marked based on its category
 */
export function canAutoMark(category: string): boolean {
  switch (category) {
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      return true
    case 'SHORT_ANSWER':
      return true // semi-auto
    case 'MATH':
      return true // requires SymPy
    case 'STRUCTURED':
      return true // depends on sub-questions
    case 'ESSAY':
      return false
    default:
      return false
  }
}

/**
 * Factory function to select and run the appropriate marking strategy
 */
export function autoMark(
  category: string,
  studentAnswer: any,
  correctAnswer: any,
  options: any[] | undefined,
  config: MarkingConfig
): MarkingResult {
  switch (category) {
    case 'MULTIPLE_CHOICE': {
      const correctOptions = (options || []).filter((o: any) => o.isCorrect)
      return markMultipleChoice(studentAnswer, correctOptions, config.marks)
    }
    case 'TRUE_FALSE':
      return markTrueFalse(studentAnswer === 'true' || studentAnswer === true, correctAnswer === 'true' || correctAnswer === true, config.marks)
    case 'SHORT_ANSWER':
      return markShortAnswer(studentAnswer, correctAnswer || '', config)
    case 'MATH':
      return markMathQuestion(studentAnswer, correctAnswer, config.tolerance || 0.01, config.marks)
    default:
      return {
        score: 0,
        maxMarks: config.marks,
        percentage: 0,
        autoMarked: false,
        isCorrect: null,
        confidence: 0,
        details: [{ type: 'error', message: `Cannot auto-mark category: ${category}` }]
      }
  }
}