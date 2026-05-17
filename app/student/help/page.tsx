"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Mail,
  Send,
  AlertOctagon,
  BookOpen,
} from "lucide-react";

const FAQS: any[] = []

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 sm:p-8">
        {/* Quick contact */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Card icon={Mail} title="Email support" text="support@swears.edu" />
          <Card icon={LifeBuoy} title="Live chat" text="Mon–Fri, 8:00–18:00" />
          <Card icon={BookOpen} title="Student handbook" text="Read policies & procedures" />
        </section>

        {/* FAQs */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border rounded-md border border-border bg-card">
            {FAQS.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No FAQs available</p>
              </div>
            ) : (
              FAQS.map((f, i) => (
                <Faq key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
              ))
            )}
          </div>
        </section>

        {/* Support form */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-md border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Contact support
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Subject" placeholder="Briefly describe the issue" full />
              <Field label="Category">
                <select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Technical issue</option>
                  <option>Exam access</option>
                  <option>Result query</option>
                  <option>Academic appeal</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Related module">
                <select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Operating Systems</option>
                  <option>Advanced Algorithms</option>
                  <option>Database Management</option>
                  <option>Computer Networks</option>
                  <option>None</option>
                </select>
              </Field>
              <Field label="Message" full>
                <textarea
                  rows={6}
                  placeholder="Describe what happened, when, and any error messages…"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4" /> Submit ticket
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <AlertOctagon className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Stuck mid-exam?
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Call the emergency invigilation line: <span className="font-mono font-semibold">+260 211 000 911</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Response time</p>
              <p className="mt-1">Most tickets are answered within 4 working hours.</p>
            </div>
          </div>
        </section>
    </div>
  );
}

function Faq({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm text-muted-foreground">{a}</p>
      )}
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof LifeBuoy;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  full,
  children,
}: {
  label: string;
  placeholder?: string;
  full?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children ?? (
        <input
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      )}
    </label>
  );
}