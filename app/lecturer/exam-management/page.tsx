'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Edit,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Save,
  Eye,
  Settings,
  List,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

type Status = 'draft' | 'scheduled' | 'active' | 'completed'
type ExamType = 'Mid Semester' | 'End Semester' | 'Quiz' | 'Assignment'
type QType = 'mcq' | 'essay' | 'short' | 'coding' | 'math'

interface Question {
  id: string;
  text: string;
  type: QType;
  marks: number;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
}

interface Exam {
  id: string;
  title: string;
  module: string;
  type: ExamType;
  status: Status;
  date: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
  settings: {
    shuffle: boolean;
    randomizeOptions: boolean;
    autoSubmit: boolean;
    calculator: boolean;
    fullscreen: boolean;
    aiMonitoring: boolean;
  };
}

export default function ExamManagementPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listExpanded, setListExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterType, setFilterType] = useState<ExamType | 'all'>('all')
  const [selected, setSelected] = useState<Exam | null>(null)
  const [section, setSection] = useState<'basic' | 'questions' | 'settings' | 'schedule'>('basic')

  const filtered = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.module.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus
    const matchesType = filterType === 'all' || exam.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const createNewExam = () => {
    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      title: 'New Exam',
      module: '',
      type: 'Mid Semester',
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      duration: 120,
      totalMarks: 100,
      questions: [],
      settings: {
        shuffle: true,
        randomizeOptions: true,
        autoSubmit: true,
        calculator: false,
        fullscreen: true,
        aiMonitoring: true
      }
    }
    setExams([...exams, newExam])
    setSelectedId(newExam.id)
    setSelected(newExam)
    setSection('basic')
  }

  const duplicateExam = (id: string) => {
    const exam = exams.find(e => e.id === id)
    if (!exam) return
    const duplicated: Exam = {
      ...exam,
      id: `ex-${Date.now()}`,
      title: `${exam.title} (Copy)`,
      status: 'draft'
    }
    setExams([...exams, duplicated])
    setSelectedId(duplicated.id)
    setSelected(duplicated)
  }

  const deleteExam = (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(e => e.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setSelected(null)
      }
    }
  }

  const patchSelected = (updates: Partial<Exam>) => {
    if (!selected) return
    const updated = { ...selected, ...updates }
    setExams(exams.map(e => e.id === selected.id ? updated : e))
    setSelected(updated)
  }

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-6">
        {/* TOP — header + actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Exam Management</h1>
            <p className="text-sm text-muted-foreground">Create, manage, and monitor your examinations</p>
          </div>
          <Button onClick={createNewExam}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Exam
          </Button>
        </div>

        {/* TOP — filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-10 w-32 rounded-md border border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-10 w-32 rounded-md border border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Mid Semester">Mid Semester</SelectItem>
                  <SelectItem value="End Semester">End Semester</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* MIDDLE — list + editor */}
        <div className="flex-1 bg-background">
          {/* LEFT — list */}
          <section className="w-full lg:w-2/3 xl:w-1/2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Exams ({filtered.length})</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setListExpanded(!listExpanded)}>
                  <List className="w-4 h-4 mr-1" />
                  {listExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No exams found</p>
                </li>
              ) : (
                <>
                  {(listExpanded
                    ? filtered
                    : filtered.filter((e) => e.id === selectedId).length
                      ? filtered.filter((e) => e.id === selectedId)
                      : filtered.slice(0, 1)
                  ).map((e) => (
                    <li
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className={
                        "cursor-pointer rounded-md border bg-card px-4 py-3 transition " +
                        (selectedId === e.id
                          ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/40")
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {e.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {e.module || "No module"} · {e.type}
                          </p>
                        </div>
                        <div>
                          <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>
                            {e.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {e.date} · {e.duration} min · {e.totalMarks} marks
                        </span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => duplicateExam(e.id)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteExam(e.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              )}
            </ul>

            {filtered.length > 1 && (
              <button
                onClick={() => setListExpanded(!listExpanded)}
                className="flex items-center justify-center gap-1.5 border-t border-border bg-muted/40 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {listExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> Show all {filtered.length} exams
                  </>
                )}
              </button>
            )}
          </section>

          {/* RIGHT — editor */}
          <section className="flex-1 bg-background">
            {selected ? (
              <div className="h-full overflow-auto border-l border-border">
                {/* Editor Header */}
                <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{selected.title}</h3>
                      <Badge variant={selected.status === 'active' ? 'default' : 'secondary'}>
                        {selected.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Section Tabs */}
                  <Tabs value={section} onValueChange={setSection} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Editor Content */}
                <div className="p-6">
                  {section === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Exam Title</Label>
                        <Input
                          value={selected.title}
                          onChange={(e) => patchSelected({ title: e.target.value })}
                          placeholder="Enter exam title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Module</Label>
                          <Input
                            value={selected.module}
                            onChange={(e) => patchSelected({ module: e.target.value })}
                            placeholder="e.g., CS301"
                          />
                        </div>
                        <div>
                          <Label>Exam Type</Label>
                          <Select value={selected.type} onValueChange={(value) => patchSelected({ type: value as ExamType })}>
                            <SelectTrigger className="h-10 w-full rounded-md border border-border bg-background text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mid Semester">Mid Semester</SelectItem>
                              <SelectItem value="End Semester">End Semester</SelectItem>
                              <SelectItem value="Quiz">Quiz</SelectItem>
                              <SelectItem value="Assignment">Assignment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {section === 'questions' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-foreground">Questions ({selected.questions.length})</h4>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Question
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {selected.questions.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No questions added yet</p>
                          </div>
                        ) : (
                          selected.questions.map((q, idx) => (
                            <Card key={q.id} className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Q{idx + 1}</span>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-foreground mb-2">{q.text}</p>
                              <div className="text-xs text-muted-foreground">
                                Type: {q.type} • Marks: {q.marks}
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {section === 'settings' && (
                    <div className="space-y-6">
                      <h4 className="text-md font-medium text-foreground mb-4">Exam Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Shuffle Questions</Label>
                          <input
                            type="checkbox"
                            checked={selected.settings.shuffle}
                            onChange={(e) => patchSelected({ 
                              settings: { ...selected.settings, shuffle: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Randomize Options</Label>
                          <input
                            type="checkbox"
                            checked={selected.settings.randomizeOptions}
                            onChange={(e) => patchSelected({ 
                              settings: { ...selected.settings, randomizeOptions: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto Submit</Label>
                          <input
                            type="checkbox"
                            checked={selected.settings.autoSubmit}
                            onChange={(e) => patchSelected({ 
                              settings: { ...selected.settings, autoSubmit: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Calculator Allowed</Label>
                          <input
                            type="checkbox"
                            checked={selected.settings.calculator}
                            onChange={(e) => patchSelected({ 
                              settings: { ...selected.settings, calculator: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Fullscreen Mode</Label>
                          <input
                            type="checkbox"
                            checked={selected.settings.fullscreen}
                            onChange={(e) => patchSelected({ 
                              settings: { ...selected.settings, fullscreen: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>AI Monitoring</Label>
                          <input
                            type="checkbox"
                            checked={selected.settings.aiMonitoring}
                            onChange={(e) => patchSelected({ 
                              settings: { ...selected.settings, aiMonitoring: e.target.checked }
                            })}
                            className="h-4 w-4"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {section === 'schedule' && (
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-foreground mb-4">Schedule Exam</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Exam Date</Label>
                          <Input
                            type="date"
                            value={selected.date}
                            onChange={(e) => patchSelected({ date: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={selected.duration}
                            onChange={(e) => patchSelected({ duration: parseInt(e.target.value) })}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-sm text-muted-foreground">
                Select an exam from the list, or create a new one.
              </div>
            )}
          </section>
        </div>

        {/* BOTTOM — actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Publish Exam
          </Button>
        </div>
      </div>
    </SidebarLayout>
  )
}
