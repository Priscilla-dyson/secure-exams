"use client";

import { useState } from "react";
import { Bell, KeyRound, Save, ShieldCheck, User } from "lucide-react";

export default function StudentProfile() {
  const [tab, setTab] = useState<"personal" | "password" | "notifications">("personal");

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
        <div className="flex items-center gap-4 rounded-md border border-border bg-card p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            MT
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Miles Tembo</p>
            <p className="text-xs text-muted-foreground">
              Student ID 2021-CS-0421 · Computer Science
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-[color:var(--success)]/10 px-2 py-1 text-xs font-semibold text-[color:var(--success)]">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>

        <div className="border-b border-border">
          <nav className="flex gap-6">
            {[
              { id: "personal", label: "Personal", icon: User },
              { id: "password", label: "Password", icon: KeyRound },
              { id: "notifications", label: "Notifications", icon: Bell },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as typeof tab)}
                  className={
                    "flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition " +
                    (active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {tab === "personal" && (
          <Form>
            <Field label="Full name" defaultValue="Miles Tembo" />
            <Field label="Email" type="email" defaultValue="miles.tembo@university.edu" />
            <Field label="Phone" defaultValue="+260 977 000 000" />
            <Field label="Programme" defaultValue="BSc. Computer Science" />
          </Form>
        )}
        {tab === "password" && (
          <Form>
            <Field label="Current password" type="password" />
            <Field label="New password" type="password" />
            <Field label="Confirm new password" type="password" />
          </Form>
        )}
        {tab === "notifications" && (
          <div className="space-y-3 rounded-md border border-border bg-card p-5">
            <Toggle label="Exam reminders (24h before)" defaultChecked />
            <Toggle label="Result released alerts" defaultChecked />
            <Toggle label="Faculty announcements" defaultChecked />
            <Toggle label="Weekly performance digest" />
            <div className="pt-2">
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Save className="h-4 w-4" /> Save preferences
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

function Form({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-md border border-border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="pt-2">
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  defaultValue,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}

function Toggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={
          "relative h-5 w-9 rounded-full transition " +
          (on ? "bg-primary" : "bg-muted")
        }
      >
        <span
          className={
            "absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition " +
            (on ? "left-[18px]" : "left-0.5")
          }
        />
      </button>
    </div>
  );
}