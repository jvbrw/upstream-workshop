"use client";

import { useState } from "react";
import Link from "next/link";
import { RiExternalLinkLine } from "@remixicon/react";
import { PhoneFrame } from "./components/phone-frame";

// Phase 1 — MVP
import { TodayView } from "./hydra-mvp/components/today-view";
import { HistoryView } from "./hydra-mvp/components/history-view";
import { ManageView } from "./hydra-mvp/components/manage-view";
import { generateMockData, DEFAULT_GOAL } from "./hydra-mvp/mock-data";
import type { HydrationLog } from "./hydra-mvp/types";

// Phase 2 — Accounts
import { SignInPrompt } from "./phase2-accounts/components/sign-in-prompt";
import { MigrationPrompt } from "./phase2-accounts/components/migration-prompt";
import { AccountProfile } from "./phase2-accounts/components/account-profile";
import { RemindersConfig as Phase2RemindersConfig } from "./phase2-accounts/components/reminders-config";

// Phase 3 — Social
import { StoryTemplates } from "./phase3-social/components/story-templates";
import { WeeklyRecap } from "./phase3-social/components/weekly-recap";
import { AchievementBadges } from "./phase3-social/components/achievement-badges";
import { ShareStreak } from "./phase3-social/components/share-streak";

// Story Export
import { StoryCard } from "./story-export/components/story-card";

// Reminders (enhanced)
import { RemindersConfig as EnhancedRemindersConfig } from "./reminders/components/reminders-config";

// Reminders UX (design experiment)
import { PermissionPrompt } from "./reminders-ux/components/permission-prompt";
import { RemindersHub } from "./reminders-ux/components/reminders-hub";
import { ScheduleConfig } from "./reminders-ux/components/schedule-config";
import { ActiveReminders } from "./reminders-ux/components/active-reminders";

// --- Mock data & streak calculation ---

function calculateStreak(logs: HydrationLog[], goal: number): number {
  const dayMap = new Map<string, number>();
  logs.forEach((log) => {
    const day = new Date(log.timestamp).toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + log.amount);
  });

  let streak = 0;
  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const todayTotal = dayMap.get(todayKey) ?? 0;
  const startFrom = todayTotal >= goal ? 0 : 1;

  for (let i = startFrom; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const total = dayMap.get(key) ?? 0;
    if (total >= goal) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// --- Phase definitions ---

type Screen = {
  label: string;
  render: (logs: HydrationLog[], streak: number) => React.ReactNode;
};

type Phase = {
  title: string;
  slug: string;
  screens: Screen[];
};

const noop = () => {};

const PHASES: Phase[] = [
  {
    title: "Phase 1 — MVP",
    slug: "hydra-mvp",
    screens: [
      {
        label: "TodayView",
        render: (logs, streak) => (
          <TodayView
            logs={logs}
            dailyGoal={DEFAULT_GOAL}
            streak={streak}
            onLog={noop}
          />
        ),
      },
      {
        label: "HistoryView",
        render: (logs) => (
          <HistoryView logs={logs} dailyGoal={DEFAULT_GOAL} />
        ),
      },
      {
        label: "ManageView",
        render: (logs) => (
          <ManageView logs={logs} onDelete={noop} onEdit={noop} />
        ),
      },
    ],
  },
  {
    title: "Phase 2 — Accounts",
    slug: "phase2-accounts",
    screens: [
      {
        label: "SignInPrompt",
        render: () => (
          <SignInPrompt hasLocalData={true} onSignIn={noop} onSkip={noop} />
        ),
      },
      {
        label: "MigrationPrompt",
        render: () => (
          <MigrationPrompt
            localEntries={87}
            localDays={14}
            localStreak={9}
            onMigrate={noop}
            onStartFresh={noop}
          />
        ),
      },
      {
        label: "AccountProfile",
        render: () => (
          <AccountProfile
            name="Ana Costa"
            email="ana.costa@gmail.com"
            dailyGoal={2000}
            totalEntries={87}
            streak={9}
            memberSince="Feb 2026"
            onEditProfile={noop}
            onSignOut={noop}
          />
        ),
      },
      {
        label: "RemindersConfig",
        render: () => <Phase2RemindersConfig />,
      },
    ],
  },
  {
    title: "Phase 3 — Social",
    slug: "phase3-social",
    screens: [
      { label: "StoryTemplates", render: () => <StoryTemplates /> },
      { label: "WeeklyRecap", render: () => <WeeklyRecap /> },
      { label: "AchievementBadges", render: () => <AchievementBadges /> },
      { label: "ShareStreak", render: () => <ShareStreak /> },
    ],
  },
  {
    title: "Story Export",
    slug: "story-export",
    screens: [
      {
        label: "StoryCard",
        render: () => (
          <div className="flex items-center justify-center py-4">
            <StoryCard
              consumed={2100}
              goal={2000}
              streak={12}
              date={new Date()}
            />
          </div>
        ),
      },
    ],
  },
  {
    title: "Reminders",
    slug: "reminders",
    screens: [
      { label: "RemindersConfig", render: () => <EnhancedRemindersConfig /> },
    ],
  },
  {
    title: "Reminders UX",
    slug: "reminders-ux",
    screens: [
      { label: "PermissionPrompt", render: () => <PermissionPrompt /> },
      { label: "RemindersHub", render: () => <RemindersHub /> },
      { label: "ScheduleConfig", render: () => <ScheduleConfig /> },
      { label: "ActiveReminders", render: () => <ActiveReminders /> },
    ],
  },
];

const TOTAL_SCREENS = PHASES.reduce((sum, p) => sum + p.screens.length, 0);

// --- Experiments for legacy footer links ---

const EXPERIMENTS = [
  { slug: "hydra-mvp", label: "Hydra MVP" },
  { slug: "phase2-accounts", label: "Phase 2 — Accounts" },
  { slug: "phase3-social", label: "Phase 3 — Social" },
  { slug: "story-export", label: "Story Export" },
  { slug: "reminders", label: "Reminders" },
  { slug: "reminders-ux", label: "Reminders UX" },
];

// --- Page component ---

export default function LabShowcase() {
  const [logs] = useState<HydrationLog[]>(() => generateMockData());
  const streak = calculateStreak(logs, DEFAULT_GOAL);

  return (
    <main className="min-h-screen bg-background px-4 py-12 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Hydra
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Prototype Lab
          </h1>
          <p className="mt-2 text-muted-foreground">
            {TOTAL_SCREENS} screens across {PHASES.length} experiments
          </p>

          <Link
            href="/lab/viewfinder"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Open Viewfinder
            <RiExternalLinkLine className="size-3.5" />
          </Link>
        </div>

        {/* Phases */}
        {PHASES.map((phase) => (
          <section key={phase.slug} className="mb-14">
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {phase.title}
              </h2>
              <span className="text-xs text-muted-foreground">
                {phase.screens.length}{" "}
                {phase.screens.length === 1 ? "screen" : "screens"}
              </span>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-4">
              {phase.screens.map((screen) => (
                <PhoneFrame
                  key={`${phase.slug}-${screen.label}`}
                  label={screen.label}
                  screen={phase.title}
                  href={`/lab/${phase.slug}`}
                >
                  {screen.render(logs, streak)}
                </PhoneFrame>
              ))}
            </div>
          </section>
        ))}

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-8">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Individual experiments (legacy)
          </h3>
          <div className="flex flex-wrap gap-3">
            {EXPERIMENTS.map((exp) => (
              <Link
                key={exp.slug}
                href={`/lab/${exp.slug}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {exp.label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to app
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
