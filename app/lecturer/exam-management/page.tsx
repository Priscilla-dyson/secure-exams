'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Edit,
  Calendar,
  Clock,
  Users,
  FileText,
  Copy,
  Trash2,
  Eye,
  MoveUp,
  MoveDown,
  BookOpen,
  PlayCircle,
  Archive,
  ChevronRight,
  HelpCircle,
  Save,
  Send,
  Settings,
  ListChecks,
  X,
  AlertTriangle,
  CalendarDays
} from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

// Types
interface Question {
  id: number
  type: 'mcq' | 'short' | 'essay' | 'math' | 'drawing'
  text: string
  marks: number
  options?: string[]
  correctAnswer?: string
  expectedLength?: string
}

interface Exam {
  id: number
  title: string
  module: string
  moduleCode: string
  type: string
  date: string
  time: string
  duration: string
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  students: number
  totalMarks: number
  passingMarks?: number
}


const questionTypes = [
  { id: 'mcq', name: 'Multiple Choice', icon: 'MCQ', color: 'primary', description: 'Single/multiple answers' },
  { id: 'short', name: 'Short Answer', icon: 'SA', color: 'secondary', description: 'Small text response' },
  { id: 'essay', name: 'Essay', icon: 'ES', color: 'tertiary', description: 'Long text answer' },
  { id: 'math', name: 'Mathematical', icon: 'MATH', color: 'warning', description: 'Equations & formulas' },
  { id: 'drawing', name: 'Drawing', icon: 'DRAW', color: 'info', description: 'Canvas/Image upload' },
]

// Question Bank (empty - to be populated from backend)
const questionBank: Question[] = []

export default function ExamManagementPage() {
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [activeTab, setActiveTab] = useState('details')
  const [exams, setExams] = useState<Exam[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set())
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'mcq',
    text: '',
    marks: 5,
    options: ['', '', '', ''],
    correctAnswer: '',
    expectedLength: ''
  })
  const [showQuestionBankDialog, setShowQuestionBankDialog] = useState(false)
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<Set<number>>(new Set())

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText }
      case 'scheduled': return { label: 'Scheduled', color: 'bg-primary/10 text-primary', icon: Calendar }
      case 'active': return { label: 'Active', color: 'bg-[color:var(--success)]/10 text-[color:var(--success)]', icon: PlayCircle }
      case 'completed': return { label: 'Completed', color: 'bg-muted text-muted-foreground', icon: Archive }
      default: return { label: status, color: 'bg-muted text-muted-foreground', icon: FileText }
    }
  }

  const handleCreateExam = () => {
    setSelectedExam(null)
    setActiveTab('details')
    setShowCreatePanel(true)
  }

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam)
    setActiveTab('details')
    setShowCreatePanel(true)
  }

  const handleDuplicateExam = (exam: Exam) => {
    const newExam = { ...exam, id: Date.now(), title: `${exam.title} (Copy)`, status: 'draft' as const, students: 0 }
    setExams([newExam, ...exams])
  }

  const handleDeleteExam = (id: number) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(e => e.id !== id))
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCompletedTabs(prev => new Set(prev).add(tab))
  }

  const sections = [
    { title: 'Draft Exams', icon: FileText, status: 'draft' as const, action: 'Continue Editing' },
    { title: 'Scheduled Exams', icon: Calendar, status: 'scheduled' as const, action: 'View Details' },
    { title: 'Active Exams', icon: PlayCircle, status: 'active' as const, action: 'Monitor Exam' },
    { title: 'Completed Exams', icon: Archive, status: 'completed' as const, action: 'View Results' },
  ]

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Exam Management</h1>
            <p className="text-base text-onSurface-variant mt-1">Create, schedule, and manage all your examinations in one place</p>
          </div>
          <Button onClick={handleCreateExam} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 h-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create New Exam
          </Button>
        </div>

        {/* Exam List Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const filteredExams = exams.filter(e => e.status === section.status)
            if (filteredExams.length === 0) return null
            
            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-border">
                  <div className="p-2 rounded-lg bg-muted">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  <Badge className="bg-muted text-muted-foreground">{filteredExams.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredExams.map((exam) => {
                    const statusConfig = getStatusConfig(exam.status)
                    return (
                      <Card key={exam.id} className="p-5 border border-border hover:border-primary transition-all duration-200">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
                                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{exam.moduleCode} • {exam.module}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditExam(exam)} className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDuplicateExam(exam)} className="h-8 w-8 p-0">
                                <Copy className="w-4 h-4" />
                              </Button>
                              {exam.status === 'draft' && (
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteExam(exam.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{exam.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{exam.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{exam.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{exam.students} students</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border">
                            <Button variant="link" className="text-primary hover:text-primary/90 p-0 h-auto font-medium">
                              {section.action} <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Create/Edit Exam Modal */}
        <Dialog open={showCreatePanel} onOpenChange={setShowCreatePanel}>
          <DialogContent className="w-[98vw] h-[95vh] max-w-[98vw] max-h-[95vh] overflow-hidden flex flex-col p-0 rounded-xl">
            <DialogHeader className="px-6 py-5 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedExam ? 'Edit Exam' : 'Create New Exam'}
                </DialogTitle>
                <button onClick={() => setShowCreatePanel(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Fill in the exam details below. All fields marked with * are required.</p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted p-1 mb-6">
                  <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <ListChecks className="w-4 h-4 mr-2" />
                    Questions
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Schedule
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Basic Information */}
                <TabsContent value="details" className="space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary">Exam Information</p>
                        <p className="text-sm text-primary/80">Provide the basic details about your examination</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-foreground">Exam Title <span className="text-red-500">*</span></Label>
                      <Input id="title" placeholder="e.g., Final Examination - Advanced Algorithms" className="h-11 rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="module" className="text-sm font-medium text-foreground">Module <span className="text-red-500">*</span></Label>
                      <Select>
                        <SelectTrigger className="h-11 rounded-lg border-border">
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Modules will be loaded from database */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-foreground">Exam Type</Label>
                      <Select>
                        <SelectTrigger className="h-11 rounded-lg border-border">
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mid">Mid Semester Examination</SelectItem>
                          <SelectItem value="end">End Semester Examination</SelectItem>
                          <SelectItem value="quiz">Quiz / Class Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium text-foreground">Duration (minutes) <span className="text-red-500">*</span></Label>
                      <Input id="duration" type="number" placeholder="120" className="h-11 rounded-lg border-border" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-sm font-medium text-foreground">Exam Instructions</Label>
                    <Textarea id="instructions" placeholder="Enter detailed instructions for students..." rows={4} className="rounded-lg border-border" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="totalMarks" className="text-sm font-medium text-foreground">Total Marks <span className="text-red-500">*</span></Label>
                      <Input id="totalMarks" type="number" placeholder="100" className="h-11 rounded-lg border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingMarks" className="text-sm font-medium text-foreground">Passing Marks</Label>
                      <Input id="passingMarks" type="number" placeholder="40" className="h-11 rounded-lg border-border" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleTabChange('questions')}>
                      Next: Questions <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab 2: Question Builder */}
                <TabsContent value="questions" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Question Builder</h3>
                      <p className="text-sm text-muted-foreground">Add and manage exam questions</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowQuestionBankDialog(true)}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        Import from Bank
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}>
                        <Plus className="w-4 h-4 mr-1" />
                        {showAddQuestionForm ? 'Cancel' : 'Add Question'}
                      </Button>
                    </div>
                  </div>

  
                  {/* Add Question Form */}
                  {showAddQuestionForm && (
                    <Card className="p-6 border border-border bg-card">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="questionType" className="text-sm font-medium text-foreground">Question Type</Label>
                            <Select value={newQuestion.type} onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value as Question['type'] })}>
                              <SelectTrigger className="h-11 rounded-lg border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                                <SelectItem value="short">Short Answer</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
                                <SelectItem value="math">Mathematical</SelectItem>
                                <SelectItem value="drawing">Drawing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="questionMarks" className="text-sm font-medium text-foreground">Marks <span className="text-red-500">*</span></Label>
                            <Input
                              id="questionMarks"
                              type="number"
                              value={newQuestion.marks}
                              onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 0 })}
                              placeholder="Enter marks"
                              className="h-11 rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="questionText" className="text-sm font-medium text-foreground">Question Text <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="questionText"
                            value={newQuestion.text}
                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                            placeholder="Enter your question here..."
                            rows={3}
                            className="rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        {newQuestion.type === 'mcq' && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-foreground">Options <span className="text-red-500">*</span></Label>
                            {newQuestion.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={newQuestion.correctAnswer === option}
                                  onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: option })}
                                  className="w-4 h-4 border-border accent-primary"
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(newQuestion.options || [])]
                                    newOptions[index] = e.target.value
                                    setNewQuestion({ ...newQuestion, options: newOptions })
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  className="flex-1 h-10 rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer</p>
                          </div>
                        )}

                        {(newQuestion.type === 'essay' || newQuestion.type === 'short') && (
                          <div className="space-y-2">
                            <Label htmlFor="expectedLength" className="text-sm font-medium text-foreground">Expected Length</Label>
                            <Input
                              id="expectedLength"
                              value={newQuestion.expectedLength}
                              onChange={(e) => setNewQuestion({ ...newQuestion, expectedLength: e.target.value })}
                              placeholder="e.g., 200-300 words"
                              className="h-11 rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                          <Button variant="outline" onClick={() => {
                            setShowAddQuestionForm(false)
                            setNewQuestion({
                              type: 'mcq',
                              text: '',
                              marks: 5,
                              options: ['', '', '', ''],
                              correctAnswer: '',
                              expectedLength: ''
                            })
                          }}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => {
                              if (newQuestion.text && newQuestion.marks) {
                                const questionToAdd: Question = {
                                  id: Date.now(),
                                  type: newQuestion.type!,
                                  text: newQuestion.text,
                                  marks: newQuestion.marks,
                                  options: newQuestion.type === 'mcq' ? newQuestion.options : undefined,
                                  correctAnswer: newQuestion.type === 'mcq' ? newQuestion.correctAnswer : undefined,
                                  expectedLength: (newQuestion.type === 'essay' || newQuestion.type === 'short') ? newQuestion.expectedLength : undefined,
                                }
                                setQuestions([...questions, questionToAdd])
                                setNewQuestion({
                                  type: 'mcq',
                                  text: '',
                                  marks: 5,
                                  options: ['', '', '', ''],
                                  correctAnswer: '',
                                  expectedLength: ''
                                })
                              }
                            }}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Questions List */}
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-foreground">Questions ({questions.length} total)</h4>
                      <span className="text-sm text-muted-foreground">Total Marks: {questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                    </div>
                    
                    {questions.map((question, index) => (
                      <Card key={question.id} className="p-4 border border-border hover:border-primary transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge className="bg-primary/10 text-primary text-xs">
                                {question.type === 'mcq' ? 'MCQ' : question.type.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Marks: {question.marks}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">Question {index + 1} of {questions.length}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{question.text}</p>
                            {question.options && (
                              <div className="mt-2 space-y-1">
                                {question.options.map((opt, i) => (
                                  <p key={i} className="text-xs text-foreground">
                                    {String.fromCharCode(65 + i)}) {opt} {opt === question.correctAnswer && '✓'}
                                  </p>
                                ))}
                              </div>
                            )}
                            {question.expectedLength && (
                              <p className="text-xs text-muted-foreground mt-2">Expected length: {question.expectedLength}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoveDown className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground text-center">💡 Tip: You can import questions from the Question Bank or create new ones. Drag questions to reorder.</p>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleTabChange('settings')}>
                      Next: Settings <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab 3: Exam Settings */}
                <TabsContent value="settings" className="space-y-6">
                  <div className="bg-muted border border-border rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Exam Configuration</p>
                        <p className="text-sm text-muted-foreground">Configure how the exam behaves during the test</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SettingRow label="Shuffle Questions" description="Randomize question order for each student" defaultChecked />
                    <SettingRow label="Randomize MCQ Options" description="Shuffle multiple choice answer options" defaultChecked />
                    <SettingRow label="Auto-submit on Timeout" description="Automatically submit when time expires" defaultChecked />
                    <SettingRow label="Allow Calculator" description="Permit calculator usage during exam" />
                    <SettingRow label="Allow Copy/Paste" description="Allow students to copy/paste answers" />
                    
                    <div className="pt-4">
                      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2 mb-4">Proctoring Settings</h3>
                      <SettingRow label="Fullscreen Enforcement" description="Require fullscreen mode during exam" defaultChecked />
                      <SettingRow label="AI Monitoring Enabled" description="Enable AI-powered proctoring (face detection, eye tracking)" defaultChecked />
                      <SettingRow label="Tab Switching Detection" description="Detect and log tab switches" defaultChecked />
                      <SettingRow label="Multiple Face Detection" description="Detect if multiple faces are in the camera frame" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleTabChange('schedule')}>
                      Next: Schedule <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab 4: Schedule */}
                <TabsContent value="schedule" className="space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary">Exam Schedule</p>
                        <p className="text-sm text-primary/80">Set the date and time for your examination</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium text-foreground">Start Date & Time <span className="text-red-500">*</span></Label>
                      <Input id="startDate" type="datetime-local" className="h-11 rounded-lg border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium text-foreground">End Date & Time <span className="text-red-500">*</span></Label>
                      <Input id="endDate" type="datetime-local" className="h-11 rounded-lg border-border" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-base font-semibold text-foreground border-b border-border pb-2 mb-4">Availability & Visibility</h3>
                    <SettingRow label="Publish to Students" description="Make exam visible to students immediately after creation" />
                    <SettingRow label="Allow Late Submissions" description="Allow submissions after end time (with penalty)" />
                    <SettingRow label="Allow Early Submission" description="Students can submit before end time" defaultChecked />
                    <SettingRow label="Show Results Immediately" description="Display results to students right after submission" />
                  </div>

                  <div className="bg-[color:var(--warning)]/10 border border-[color:var(--warning)]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[color:var(--warning)] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[color:var(--warning)]">Important Note</p>
                        <p className="text-sm text-[color:var(--warning)]/80">Once published, students will be able to see the exam according to the schedule. Make sure all details are correct before publishing.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowCreatePanel(false)}>Cancel</Button>
                    <Button variant="outline"><Save className="w-4 h-4 mr-2" /> Save as Draft</Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Send className="w-4 h-4 mr-2" /> Publish Exam</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

          </DialogContent>
        </Dialog>

        {/* Question Bank Import Dialog */}
        <Dialog open={showQuestionBankDialog} onOpenChange={setShowQuestionBankDialog}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-xl">
            <DialogHeader className="px-6 py-5 border-b border-border bg-card">
              <DialogTitle className="text-xl font-bold text-foreground">Import from Question Bank</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Select questions to import into your exam</p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {questionBank.map((question) => (
                  <Card key={question.id} className={`p-4 border cursor-pointer transition-all ${
                    selectedBankQuestions.has(question.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`} onClick={() => {
                    setSelectedBankQuestions(prev => {
                      const newSet = new Set(prev)
                      if (newSet.has(question.id)) {
                        newSet.delete(question.id)
                      } else {
                        newSet.add(question.id)
                      }
                      return newSet
                    })
                  }}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={selectedBankQuestions.has(question.id)}
                          onChange={() => {}}
                          className="w-4 h-4 border-border accent-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary/10 text-primary text-xs">
                            {question.type === 'mcq' ? 'MCQ' : question.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Marks: {question.marks}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-2">{question.text}</p>
                        {question.options && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((opt, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                {String.fromCharCode(65 + i)}) {opt} {opt === question.correctAnswer && '✓'}
                              </p>
                            ))}
                          </div>
                        )}
                        {question.expectedLength && (
                          <p className="text-xs text-muted-foreground mt-2">Expected length: {question.expectedLength}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-border bg-card">
              <Button variant="outline" onClick={() => {
                setShowQuestionBankDialog(false)
                setSelectedBankQuestions(new Set())
              }}>
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={selectedBankQuestions.size === 0}
                onClick={() => {
                  const questionsToImport = questionBank.filter(q => selectedBankQuestions.has(q.id))
                  const importedQuestions = questionsToImport.map(q => ({
                    ...q,
                    id: Date.now() + Math.random()
                  }))
                  setQuestions([...questions, ...importedQuestions])
                  setShowQuestionBankDialog(false)
                  setSelectedBankQuestions(new Set())
                }}
              >
                Import {selectedBankQuestions.size} Question{selectedBankQuestions.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}

// Setting Row Component
function SettingRow({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-medium text-foreground">{label}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => setChecked(!!value)}
        className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    </div>
  )
}