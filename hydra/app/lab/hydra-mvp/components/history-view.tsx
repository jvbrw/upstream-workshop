"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HydrationLog } from "../types";

type HistoryViewProps = {
  logs: HydrationLog[];
  dailyGoal: number;
};

type DaySummary = {
  date: Date;
  label: string;
  shortLabel: string;
  total: number;
  hitGoal: boolean;
};

function getLast7Days(
  logs: HydrationLog[],
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

function getStats(logs: HydrationLog[], dailyGoal: number) {
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

  // Calculate best streak
  const sortedDays = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b));

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

export function HistoryView({ logs, dailyGoal }: HistoryViewProps) {
  const weekData = getLast7Days(logs, dailyGoal);
  const maxTotal = Math.max(...weekData.map((d) => d.total), dailyGoal);
  const stats = getStats(logs, dailyGoal);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardContent>
          {/* Legend */}
          <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 border-t border-dashed border-muted-foreground/40" />
              <span>Daily goal ({dailyGoal >= 1000 ? `${dailyGoal / 1000}L` : `${dailyGoal}ml`})</span>
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
                  {/* Amount label */}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {day.total >= 1000
                      ? `${Math.round(day.total / 100) / 10}L`
                      : day.total > 0
                        ? `${day.total}`
                        : "—"}
                  </span>

                  {/* Bar container */}
                  <div className="relative flex h-[140px] w-full items-end">
                    {/* Goal line */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/20"
                      style={{
                        bottom: `${(dailyGoal / maxTotal) * 140}px`,
                      }}
                    />
                    {/* Bar */}
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

                  {/* Day label */}
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

      {/* 14-day overview */}
      <Card>
        <CardHeader>
          <CardTitle>Last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (13 - i));
              date.setHours(0, 0, 0, 0);

              const nextDay = new Date(date);
              nextDay.setDate(nextDay.getDate() + 1);

              const dayTotal = logs
                .filter((log) => {
                  const t = new Date(log.timestamp);
                  return t >= date && t < nextDay;
                })
                .reduce((sum, log) => sum + log.amount, 0);

              const intensity = Math.min(dayTotal / dailyGoal, 1);
              const hitGoal = dayTotal >= dailyGoal;

              return (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-medium ${
                    hitGoal
                      ? "bg-emerald-500/20 text-emerald-600"
                      : intensity > 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                  style={{
                    opacity: intensity > 0 ? 0.4 + intensity * 0.6 : 0.5,
                  }}
                  title={`${date.toLocaleDateString()}: ${dayTotal}ml`}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
