"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  PlayCircle, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle,
  Search
} from "lucide-react";

interface Exam {
  id: string;
  module: string;
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: "active" | "upcoming" | "completed" | "missed";
  totalMarks: number;
  timeRemaining?: string;
  score?: number;
}

const exams: Exam[] = []

export default function ExaminationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "completed" | "missed">("all");

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || exam.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6"> 
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Examinations</h1>
        <p className="text-sm text-muted-foreground mt-1">View and access all your scheduled exams</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "upcoming", "completed", "missed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:bg-muted"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
        {filteredExams.length === 0 && (
          <div className="text-center py-12 border border-border rounded-md bg-card">
            <p className="text-muted-foreground">No exams found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const getStatusBadge = () => {
    switch (exam.status) {
      case "active":
        return <span className="inline-flex items-center gap-1 rounded bg-[color:var(--success)]/10 px-2 py-0.5 text-xs font-semibold text-[color:var(--success)]"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] animate-pulse" /> Active</span>;
      case "upcoming":
        return <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"><Lock className="h-3 w-3" /> Upcoming</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1 rounded bg-[color:var(--success)]/10 px-2 py-0.5 text-xs font-semibold text-[color:var(--success)]"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
      case "missed":
        return <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"><AlertCircle className="h-3 w-3" /> Missed</span>;
    }
  };

  const getButton = () => {
    if (exam.status === "active") {
      return (
        <Link href={`/student/examinations/${exam.id}`} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <PlayCircle className="h-4 w-4" /> Enter Exam
        </Link>
      );
    }
    if (exam.status === "completed") {
      return (
        <Link href={`/student/results/${exam.id}`} className="inline-flex items-center gap-1 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
          View Results
        </Link>
      );
    }
    if (exam.status === "missed") {
      return (
        <Link href="/student/help" className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
          Request Review
        </Link>
      );
    }
    return (
      <button disabled className="inline-flex items-center gap-1 rounded-md bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground cursor-not-allowed">
        <Lock className="h-4 w-4" /> Locked
      </button>
    );
  };

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="text-lg font-semibold text-foreground">{exam.module}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">{exam.title}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {exam.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {exam.time} · {exam.duration}</span>
            <span>{exam.totalMarks} marks</span>
            {exam.status === "active" && exam.timeRemaining && (
              <span className="text-[color:var(--success)]">{exam.timeRemaining}</span>
            )}
            {exam.status === "completed" && exam.score && (
              <span className="text-[color:var(--success)]">Score: {exam.score}%</span>
            )}
          </div>
        </div>
        {getButton()}
      </div>
    </div>
  );
}