'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Bell,
  Lock,
  PlayCircle,
  ChevronRight,
  Megaphone,
  Award,
  Clock,
} from "lucide-react";

export default function StudentDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/student/exams');
      const data = await response.json();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingCount = exams.filter(e => !e.hasAttempted && new Date(e.scheduledDate) > new Date()).length;
  const activeCount = exams.filter(e => !e.hasAttempted && new Date(e.scheduledDate) <= new Date() && new Date(e.endDate) > new Date()).length;
  const completedCount = exams.filter(e => e.hasAttempted).length;
  const missedCount = 0; // Will be calculated based on end date

  const activeExams = exams.filter(e => !e.hasAttempted && new Date(e.scheduledDate) <= new Date() && new Date(e.endDate) > new Date());
  const upcomingExams = exams.filter(e => !e.hasAttempted && new Date(e.scheduledDate) > new Date());
  const completedExams = exams.filter(e => e.hasAttempted);

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={CalendarDays} label="Upcoming" value={upcomingCount} />
        <Stat icon={PlayCircle} label="Active Now" value={activeCount} accent="success" />
        <Stat icon={CheckCircle2} label="Completed" value={completedCount} />
        <Stat icon={XCircle} label="Missed" value={missedCount} accent="destructive" />
      </section>

      {/* Active exams - Available right now */}
      <Section title="Active Exams" caption="Available right now">
        {activeExams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No active exams available</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activeExams.map((exam) => (
              <ActiveCard
                key={exam.id}
                module={exam.module?.name || 'Unknown Module'}
                type={exam.type}
                endsIn={getCountdown(exam.endDate)}
                examId={exam.id}
                status={exam.status}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* Upcoming exams - Locked */}
      <Section title="Upcoming Exams" caption="Locked until the official start time">
        {upcomingExams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No upcoming exams scheduled</p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {upcomingExams.map((exam) => (
              <UpcomingRow
                key={exam.id}
                module={exam.module?.name || 'Unknown Module'}
                type={exam.type}
                date={new Date(exam.scheduledDate).toLocaleDateString()}
                duration={`${exam.duration} min`}
                countdown={getCountdown(exam.scheduledDate)}
              />
            ))}
          </ul>
        )}
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Questions and exam paper become visible only at the scheduled time.
        </p>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completed */}
        <Section title="Recently Completed" caption="Submitted exams">
          {completedExams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No completed exams</p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {completedExams.map((exam) => (
                <CompletedRow key={exam.id} module={exam.module?.name || 'Unknown Module'} date={new Date(exam.scheduledDate).toLocaleDateString()} status={exam.attemptStatus || 'Submitted'} />
              ))}
            </ul>
          )}
        </Section>

        {/* Missed */}
        <Section title="Missed Exams" caption="Marked absent">
          {completedExams.filter((e: any) => e.attemptStatus === 'missed').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No missed exams</p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {completedExams.filter((e: any) => e.attemptStatus === 'missed').map((exam) => (
                <MissedRow key={exam.id} module={exam.module?.name || 'Unknown Module'} date={new Date(exam.scheduledDate).toLocaleDateString()} reason="Did not attend" />
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Notifications */}
      <Section title="Notifications" caption="Reminders, announcements, results">
        <ul className="space-y-2">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        </ul>
      </Section>

      {/* Integrity */}
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Integrity standing: Clean
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Biometric verification and proctoring history have no flags. Maintain
              academic integrity for continued fast-track results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: "success" | "destructive" | "warning" }) {
  const tone = accent === "success" ? "text-[color:var(--success)] bg-[color:var(--success)]/10"
    : accent === "destructive" ? "text-destructive bg-destructive/10"
    : accent === "warning" ? "text-[color:var(--warning)] bg-[color:var(--warning)]/10"
    : "text-primary bg-primary/10";
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        <span className={"flex h-8 w-8 items-center justify-center rounded-md " + tone}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Section({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
        {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
      </div>
      {children}
    </section>
  );
}

function ActiveCard({ module, type, endsIn, examId, status }: { module: string; type: string; endsIn: string; examId: string; status: string }) {
  return (
    <li className="flex flex-col gap-3 rounded-md border border-[color:var(--success)]/30 bg-[color:var(--success)]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[color:var(--success)]" />
          <p className="text-sm font-semibold text-foreground">{module}</p>
          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{type}</span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{endsIn}</p>
      </div>
      <Link
        href={`/student/examinations/${examId}`}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <PlayCircle className="h-4 w-4" />
        Enter Exam
      </Link>
    </li>
  );
}

function UpcomingRow({ module, type, date, duration, countdown }: { module: string; type: string; date: string; duration: string; countdown: string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{module}</p>
        <p className="text-xs text-muted-foreground">{type} · {date} · {duration}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{countdown}</span>
        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
          <Lock className="h-3 w-3" />
          Locked
        </span>
      </div>
    </li>
  );
}

function CompletedRow({ module, date, status }: { module: string; date: string; status: string }) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{module}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded bg-[color:var(--success)]/10 px-2 py-1 text-[11px] font-semibold text-[color:var(--success)]">
        <CheckCircle2 className="h-3 w-3" />
        {status}
      </span>
    </li>
  );
}

function MissedRow({ module, date, reason }: { module: string; date: string; reason: string }) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{module}</p>
        <p className="text-xs text-muted-foreground">{date} · {reason}</p>
      </div>
      <Link href="/student/help" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        Request review <ChevronRight className="h-3 w-3" />
      </Link>
    </li>
  );
}

function Notice({ icon: Icon, text, tone }: { icon: any; text: string; tone: "success" | "warning" | "info" }) {
  const color = tone === "success" ? "text-[color:var(--success)]" : tone === "warning" ? "text-[color:var(--warning)]" : "text-primary";
  return (
    <li className="flex items-start gap-2 rounded-md border border-border bg-card p-3 text-sm text-foreground">
      <Icon className={"mt-0.5 h-4 w-4 " + color} />
      <span>{text}</span>
    </li>
  );
}