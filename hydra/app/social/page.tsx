"use client";

import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiDropLine,
  RiFireLine,
  RiMedalLine,
  RiTrophyLine,
  RiShieldStarLine,
  RiLockLine,
  RiCheckLine,
} from "@remixicon/react";
import {
  useHydrationStore,
  useTodayTotal,
  useStreak,
} from "@/hooks/use-hydration-store";
import {
  ThemedStoryCard,
  type Theme,
} from "@/app/lab/phase3-social/components/themed-story-card";
import { RecapCard } from "@/app/lab/phase3-social/components/recap-card";
import { StreakCard } from "@/app/lab/phase3-social/components/streak-card";
import { ShareButton } from "@/app/lab/phase3-social/components/share-button";

// --- Badge definitions ---

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
};

const BADGE_DEFS: Badge[] = [
  {
    id: "first-glass",
    name: "First Glass",
    description: "Log your first entry",
    icon: RiDropLine,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "7-day-streak",
    name: "7-Day Streak",
    description: "7 consecutive days on goal",
    icon: RiFireLine,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "30-day-streak",
    name: "30-Day Streak",
    description: "30 consecutive days on goal",
    icon: RiMedalLine,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "100l-club",
    name: "100L Club",
    description: "Log 100 liters total",
    icon: RiTrophyLine,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "hydration-hero",
    name: "Hydration Hero",
    description: "Exceed goal by 50% in a day",
    icon: RiShieldStarLine,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

// --- Card type + template defs ---

type CardType = "daily" | "weekly" | "streak";

const THEMES: { id: Theme; label: string; preview: string }[] = [
  {
    id: "dark",
    label: "Dark",
    preview: "linear-gradient(135deg, oklch(0.18 0.04 230), oklch(0.08 0.02 270))",
  },
  {
    id: "light",
    label: "Light",
    preview: "linear-gradient(135deg, oklch(0.98 0.005 260), oklch(0.96 0.01 210))",
  },
  {
    id: "neon",
    label: "Neon",
    preview: "linear-gradient(135deg, oklch(0.10 0.02 300), oklch(0.08 0.02 280))",
  },
  {
    id: "ocean",
    label: "Ocean",
    preview: "linear-gradient(135deg, oklch(0.25 0.08 210), oklch(0.12 0.04 230))",
  },
];

// --- Helpers ---

function getBadgeState(
  logs: { timestamp: string; amount: number }[],
  dailyGoal: number,
  currentStreak: number
) {
  const totalMl = logs.reduce((sum, l) => sum + l.amount, 0);

  // Check if any day exceeded 150% of goal
  const dayMap = new Map<string, number>();
  logs.forEach((l) => {
    const day = new Date(l.timestamp).toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + l.amount);
  });
  const hasHeroDay = Array.from(dayMap.values()).some(
    (t) => t >= dailyGoal * 1.5
  );

  // Best streak calculation
  const sortedDays = Array.from(dayMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  let bestStreak = 0;
  let runStreak = 0;
  sortedDays.forEach(([, total]) => {
    if (total >= dailyGoal) {
      runStreak++;
      bestStreak = Math.max(bestStreak, runStreak);
    } else {
      runStreak = 0;
    }
  });

  return {
    "first-glass": { unlocked: logs.length > 0 },
    "7-day-streak": {
      unlocked: bestStreak >= 7,
      progress: { current: Math.min(bestStreak, 7), target: 7 },
    },
    "30-day-streak": {
      unlocked: bestStreak >= 30,
      progress: { current: Math.min(bestStreak, 30), target: 30 },
    },
    "100l-club": {
      unlocked: totalMl >= 100000,
      progress: {
        current: Math.min(Math.round(totalMl / 1000), 100),
        target: 100,
      },
    },
    "hydration-hero": {
      unlocked: hasHeroDay,
      progress: { current: hasHeroDay ? 1 : 0, target: 1 },
    },
  };
}

function getLast7DayTotals(
  logs: { timestamp: string; amount: number }[],
  dailyGoal: number
): number[] {
  const totals: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const total = logs
      .filter((l) => {
        const t = new Date(l.timestamp);
        return t >= date && t < next;
      })
      .reduce((s, l) => s + l.amount, 0);

    totals.push(total);
  }
  return totals;
}

// --- Component ---

export default function SocialPage() {
  const logs = useHydrationStore((s) => s.logs);
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  const todayTotal = useTodayTotal();
  const streak = useStreak();

  const [cardType, setCardType] = useState<CardType>("daily");
  const [theme, setTheme] = useState<Theme>("dark");
  const cardRef = useRef<HTMLDivElement>(null);

  const badgeState = useMemo(
    () => getBadgeState(logs, dailyGoal, streak),
    [logs, dailyGoal, streak]
  );

  const unlockedCount = Object.values(badgeState).filter(
    (b) => b.unlocked
  ).length;

  const weekTotals = useMemo(
    () => getLast7DayTotals(logs, dailyGoal),
    [logs, dailyGoal]
  );

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Social</h1>
        <p className="text-sm text-muted-foreground">
          Badges &amp; shareable progress
        </p>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Badges</p>
          <span className="text-xs text-muted-foreground">
            {unlockedCount}/{BADGE_DEFS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${(unlockedCount / BADGE_DEFS.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground">
            {Math.round((unlockedCount / BADGE_DEFS.length) * 100)}%
          </span>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-5 gap-2">
          {BADGE_DEFS.map((badge) => {
            const state = badgeState[badge.id as keyof typeof badgeState];
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`relative flex size-12 items-center justify-center rounded-xl ${
                    state.unlocked ? badge.bgColor : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`size-5 ${
                      state.unlocked
                        ? badge.color
                        : "text-muted-foreground/50"
                    }`}
                  />
                  {!state.unlocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-muted-foreground/20">
                      <RiLockLine className="size-2.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span
                  className={`text-center text-[9px] font-medium leading-tight ${
                    state.unlocked
                      ? "text-foreground"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Next badge to unlock */}
        {unlockedCount < BADGE_DEFS.length && (() => {
          const nextBadge = BADGE_DEFS.find(
            (b) => !badgeState[b.id as keyof typeof badgeState].unlocked
          );
          if (!nextBadge) return null;
          const state = badgeState[nextBadge.id as keyof typeof badgeState];
          const progress = "progress" in state ? state.progress : undefined;
          const Icon = nextBadge.icon;
          return (
            <Card>
              <CardContent className="flex items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${nextBadge.bgColor}`}
                >
                  <Icon className={`size-5 ${nextBadge.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    Next: {nextBadge.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {nextBadge.description}
                  </p>
                  {progress && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(progress.current / progress.target) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {progress.current}/{progress.target}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Share section */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">
          Share your progress
        </p>

        {/* Card type selector */}
        <div className="flex gap-2">
          {(
            [
              { id: "daily", label: "Daily" },
              { id: "weekly", label: "Weekly" },
              { id: "streak", label: "Streak" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setCardType(t.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors ${
                cardType === t.id
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Template picker (daily only) */}
        {cardType === "daily" && (
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition-all ${
                  theme === t.id
                    ? "border-primary"
                    : "border-transparent hover:border-border"
                }`}
              >
                <div
                  className="h-8 w-full rounded-md"
                  style={{ background: t.preview }}
                />
                <span className="text-[9px] font-medium text-muted-foreground">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Card preview */}
        <div className="flex justify-center">
          <div className="origin-top scale-[0.85]">
            {cardType === "daily" && (
              <ThemedStoryCard
                ref={cardRef}
                consumed={Math.max(todayTotal, dailyGoal)}
                goal={dailyGoal}
                streak={streak}
                date={new Date()}
                theme={theme}
              />
            )}
            {cardType === "weekly" && (
              <RecapCard
                ref={cardRef}
                weekLabel={weekLabel}
                dailyTotals={weekTotals}
                goal={dailyGoal}
                streak={streak}
              />
            )}
            {cardType === "streak" && (
              <StreakCard
                ref={cardRef}
                streak={Math.max(streak, 1)}
                todayConsumed={todayTotal}
                todayGoal={dailyGoal}
              />
            )}
          </div>
        </div>

        {/* Share button */}
        <ShareButton
          cardRef={cardRef}
          filename={`hydra-${cardType}.png`}
          shareText={
            cardType === "daily"
              ? "I hit my daily hydration goal with Hydra!"
              : cardType === "weekly"
                ? "My weekly hydration recap — tracked with Hydra!"
                : `I'm on a ${streak}-day hydration streak with Hydra!`
          }
        />
      </div>
    </div>
  );
}
