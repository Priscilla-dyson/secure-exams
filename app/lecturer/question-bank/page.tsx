'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Copy, Filter, X, BookOpen, Layers, Calendar, BarChart3 } from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const questions: any[] = []

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.module.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === 'all' || q.module === selectedModule
    const matchesType = selectedType === 'all' || q.type === selectedType
    return matchesSearch && matchesModule && matchesType
  })

  const getTypeBadge = (type: string) => {
    const styles = {
      mcq: 'bg-primary/10 text-primary',
      essay: 'bg-warning/10 text-warning',
      short: 'bg-success/10 text-success',
      coding: 'bg-destructive/10 text-destructive',
      math: 'bg-muted text-muted-foreground'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[type as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {type.toUpperCase()}
      </span>
    )
  }

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      Easy: 'bg-success/10 text-success',
      Medium: 'bg-warning/10 text-warning',
      Hard: 'bg-destructive/10 text-destructive'
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[difficulty as keyof typeof styles] || 'bg-muted text-muted-foreground'}`}>
        {difficulty}
      </span>
    )
  }

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Question Bank</h1>
            <p className="text-sm text-muted-foreground">Store, organize, and reuse questions across multiple examinations</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add New Question
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Total Questions
              </p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{questions.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">All types</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Question Types
              </p>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">4</p>
            <p className="mt-1 text-xs text-muted-foreground">MCQ, Essay, Short, Coding</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Modules
              </p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">4</p>
            <p className="mt-1 text-xs text-muted-foreground">Active this semester</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Times Used
              </p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">7</p>
            <p className="mt-1 text-xs text-muted-foreground">Across exams</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="h-10 w-40 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 w-32 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="rounded-md border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Marks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Used In
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No questions found</p>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-accent/50">
                    <td className="px-4 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-foreground line-clamp-2">{question.text}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getTypeBadge(question.type)}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{question.module}</p>
                        <p className="text-xs text-muted-foreground">{question.moduleName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{question.marks}</td>
                    <td className="px-4 py-4">
                      {getDifficultyBadge(question.difficulty)}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{question.created}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{question.usedIn} exams</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-muted-foreground hover:text-foreground" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-foreground" title="Copy">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-destructive" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
