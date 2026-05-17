"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHydrationStore } from "@/hooks/use-hydration-store";
import { cn } from "@/lib/utils";

type DaySummary = {
  date: Date;
  label: string;
  shortLabel: string;
  total: number;
  hitGoal: boolean;
};

function getLast7Days(
  logs: { timestamp: string; amount: number }[],
  dailyGoal: number
): DaySummary[] {
  const days: DaySummary[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayLogs = logs.filter((log) => {
      const t = new Date(log.timestamp);
      return t >= date && t < nextDay;
    });

    const total = dayLogs.reduce((sum, log) => sum + log.amount, 0);

    days.push({
      date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      shortLabel: date.toLocaleDateString("en-US", { weekday: "narrow" }),
      total,
      hitGoal: total >= dailyGoal,
    });
  }

  return days;
}

function getStats(
  logs: { timestamp: string; amount: number }[],
  dailyGoal: number
) {
  const dayMap = new Map<string, number>();

  logs.forEach((log) => {
    const day = new Date(log.timestamp).toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + log.amount);
  });

  const dailyTotals = Array.from(dayMap.values());
  const avgIntake =
    dailyTotals.length > 0
      ? Math.round(dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length)
      : 0;

  const daysOnGoal = dailyTotals.filter((t) => t >= dailyGoal).length;
  const goalRate =
    dailyTotals.length > 0
      ? Math.round((daysOnGoal / dailyTotals.length) * 100)
      : 0;

  const sortedDays = Array.from(dayMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  let bestStreak = 0;
  let currentStreak = 0;

  sortedDays.forEach(([, total]) => {
    if (total >= dailyGoal) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return { avgIntake, goalRate, bestStreak, totalDays: dailyTotals.length };
}

function buildDayMap(logs: { timestamp: string; amount: number }[]) {
  const map = new Map<string, number>();
  logs.forEach((log) => {
    const day = new Date(log.timestamp).toISOString().split("T")[0];
    map.set(day, (map.get(day) ?? 0) + log.amount);
  });
  return map;
}

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HistoryPage() {
  const logs = useHydrationStore((s) => s.logs);
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const weekData = getLast7Days(logs, dailyGoal);
  const maxTotal = Math.max(...weekData.map((d) => d.total), dailyGoal);
  const stats = getStats(logs, dailyGoal);

  const monthData = useMemo(() => {
    const dayMap = buildDayMap(logs);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: {
      date: Date;
      dayOfMonth: number;
      total: number;
      hitGoal: boolean;
      intensity: number;
      key: string;
    }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      const total = dayMap.get(key) ?? 0;
      const intensity = Math.min(total / dailyGoal, 1);

      days.push({
        date,
        dayOfMonth: date.getDate(),
        total,
        hitGoal: total >= dailyGoal,
        intensity,
        key,
      });
    }

    // Padding: how many empty cells before the first day to align with weekday
    const firstDayOfWeek = days[0].date.getDay(); // 0=Sun
    return { days, paddingBefore: firstDayOfWeek };
  }, [logs, dailyGoal]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-20 text-center">
        <p className="text-lg font-medium text-foreground">No history yet</p>
        <p className="text-sm text-muted-foreground">
          Start logging water on the Today tab to see your patterns here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground">
            {period === "week" ? "Last 7 days" : "Last 30 days"}
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex rounded-full bg-muted p-1">
          <button
            aria-pressed={period === "week"}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              period === "week"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setPeriod("week")}
          >
            Week
          </button>
          <button
            aria-pressed={period === "month"}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              period === "month"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setPeriod("month")}
          >
            Month
          </button>
        </div>
      </div>

      {/* Weekly Chart */}
      {period === "week" && (
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted-foreground/40" />
                <span>
                  Goal (
                  {dailyGoal >= 1000
                    ? `${dailyGoal / 1000}L`
                    : `${dailyGoal}ml`}
                  )
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm bg-emerald-500/80" />
                <span>Goal met</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              {weekData.map((day) => {
                const height = maxTotal > 0 ? (day.total / maxTotal) * 140 : 0;
                const isToday =
                  day.date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={day.label}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {day.total >= 1000
                        ? `${Math.round(day.total / 100) / 10}L`
                        : day.total > 0
                          ? `${day.total}`
                          : "—"}
                    </span>

                    <div className="relative flex h-[140px] w-full items-end">
                      <div
                        className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/20"
                        style={{
                          bottom: `${(dailyGoal / maxTotal) * 140}px`,
                        }}
                      />
                      <div
                        className={`w-full rounded-t-md motion-safe:transition-all motion-safe:duration-500 ${
                          day.hitGoal
                            ? "bg-emerald-500/80"
                            : isToday
                              ? "bg-primary"
                              : "bg-primary/40"
                        }`}
                        style={{ height: `${Math.max(height, 4)}px` }}
                      />
                    </div>

                    <span
                      className={`text-xs ${
                        isToday
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Heat Map */}
      {period === "month" && (
        <Card>
          <CardHeader>
            <CardTitle>Last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Weekday labels */}
            <div className="mb-1 grid grid-cols-7 gap-1.5">
              {WEEK_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-medium text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Padding cells */}
              {Array.from({ length: monthData.paddingBefore }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {/* Day cells */}
              {monthData.days.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-[10px] font-medium",
                    day.hitGoal
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : day.intensity > 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                  style={{
                    opacity: day.intensity > 0 ? 0.4 + day.intensity * 0.6 : 0.5,
                  }}
                  title={`${day.date.toLocaleDateString()}: ${day.total}ml`}
                >
                  {day.dayOfMonth}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.avgIntake >= 1000
                ? `${Math.round(stats.avgIntake / 100) / 10}L`
                : `${stats.avgIntake}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <p className="text-xs text-muted-foreground">Avg daily</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.bestStreak}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <p className="text-xs text-muted-foreground">Best streak</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-2xl font-bold text-foreground">
              {stats.goalRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <p className="text-xs text-muted-foreground">Goal rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
