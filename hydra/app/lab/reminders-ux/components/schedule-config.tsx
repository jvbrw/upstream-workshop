"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RiTimeLine,
  RiRepeatLine,
  RiCalendarLine,
  RiCheckLine,
  RiMagicLine,
  RiSunLine,
  RiBriefcaseLine,
  RiMoonLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

type Schedule = {
  preset: string | null;
  activeDays: number[];
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  dailySummary: boolean;
  smartReminders: boolean;
};

const DAYS = [
  { value: 1, short: "M", label: "Monday" },
  { value: 2, short: "T", label: "Tuesday" },
  { value: 3, short: "W", label: "Wednesday" },
  { value: 4, short: "T", label: "Thursday" },
  { value: 5, short: "F", label: "Friday" },
  { value: 6, short: "S", label: "Saturday" },
  { value: 0, short: "S", label: "Sunday" },
];

const PRESETS = [
  {
    id: "workday",
    label: "Work day",
    icon: RiBriefcaseLine,
    desc: "Mon–Fri, 8am–6pm",
    days: [1, 2, 3, 4, 5],
    start: "08:00",
    end: "18:00",
    interval: 60,
  },
  {
    id: "fullday",
    label: "Full day",
    icon: RiSunLine,
    desc: "Every day, 7am–10pm",
    days: [0, 1, 2, 3, 4, 5, 6],
    start: "07:00",
    end: "22:00",
    interval: 90,
  },
  {
    id: "evening",
    label: "Evening",
    icon: RiMoonLine,
    desc: "Every day, 5pm–11pm",
    days: [0, 1, 2, 3, 4, 5, 6],
    start: "17:00",
    end: "23:00",
    interval: 60,
  },
];

const INTERVALS = [
  { value: 30, label: "30m" },
  { value: 45, label: "45m" },
  { value: 60, label: "1h" },
  { value: 90, label: "1.5h" },
  { value: 120, label: "2h" },
];

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function MiniTimeline({
  startTime,
  endTime,
  intervalMinutes,
}: {
  startTime: string;
  endTime: string;
  intervalMinutes: number;
}) {
  const startMin = parseTime(startTime);
  const endMin = parseTime(endTime);
  const windowMin = endMin - startMin;
  const count = windowMin > 0 ? Math.floor(windowMin / intervalMinutes) : 0;

  const dots = Array.from({ length: count }, (_, i) => {
    const offset = i * intervalMinutes;
    return ((startMin + offset) / (24 * 60)) * 100;
  });

  return (
    <div className="relative h-6 rounded-full bg-muted/50">
      {/* Active window */}
      <div
        className="absolute inset-y-0 rounded-full bg-primary/15"
        style={{
          left: `${(startMin / (24 * 60)) * 100}%`,
          width: `${(windowMin / (24 * 60)) * 100}%`,
        }}
      />
      {/* Dots */}
      {dots.map((pct, i) => (
        <div
          key={i}
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct}%` }}
        />
      ))}
    </div>
  );
}

export function ScheduleConfig() {
  const [schedule, setSchedule] = useState<Schedule>({
    preset: "workday",
    activeDays: [1, 2, 3, 4, 5],
    startTime: "08:00",
    endTime: "18:00",
    intervalMinutes: 60,
    dailySummary: true,
    smartReminders: false,
  });

  const [showCustom, setShowCustom] = useState(false);

  function applyPreset(presetId: string) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSchedule((s) => ({
      ...s,
      preset: presetId,
      activeDays: preset.days,
      startTime: preset.start,
      endTime: preset.end,
      intervalMinutes: preset.interval,
    }));
    setShowCustom(false);
  }

  function toggleDay(day: number) {
    setSchedule((s) => {
      const has = s.activeDays.includes(day);
      return {
        ...s,
        preset: null,
        activeDays: has
          ? s.activeDays.filter((d) => d !== day)
          : [...s.activeDays, day],
      };
    });
  }

  const windowMin = parseTime(schedule.endTime) - parseTime(schedule.startTime);
  const remindersPerDay =
    windowMin > 0 ? Math.floor(windowMin / schedule.intervalMinutes) : 0;
  const weeklyTotal = remindersPerDay * schedule.activeDays.length;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Pick a preset or build your own
        </p>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        {PRESETS.map((preset) => {
          const active = schedule.preset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  active ? "bg-primary/10" : "bg-muted"
                )}
              >
                <preset.icon
                  className={cn(
                    "size-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-foreground"
                  )}
                >
                  {preset.label}
                </p>
                <p className="text-xs text-muted-foreground">{preset.desc}</p>
              </div>
              {active && (
                <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                  <RiCheckLine className="size-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}

        {/* Custom toggle */}
        <button
          onClick={() => {
            setShowCustom(!showCustom);
            setSchedule((s) => ({ ...s, preset: null }));
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all",
            showCustom && !schedule.preset
              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
              : "border-border hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              showCustom && !schedule.preset ? "bg-primary/10" : "bg-muted"
            )}
          >
            <RiMagicLine
              className={cn(
                "size-5 transition-colors",
                showCustom && !schedule.preset
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Custom</p>
            <p className="text-xs text-muted-foreground">
              Build your own schedule
            </p>
          </div>
        </button>
      </div>

      {/* Custom configuration */}
      {(showCustom || !schedule.preset) && (
        <div className="space-y-4">
          {/* Days */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiCalendarLine className="size-4 text-muted-foreground" />
                <CardTitle>Days</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {DAYS.map((day) => {
                  const active = schedule.activeDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      aria-label={`${active ? "Disable" : "Enable"} ${day.label}`}
                      aria-pressed={active}
                      className={cn(
                        "flex size-10 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time window */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiTimeLine className="size-4 text-muted-foreground" />
                <CardTitle>Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                    From
                  </label>
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        preset: null,
                        startTime: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-center text-lg font-semibold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <span className="mt-5 text-sm text-muted-foreground">—</span>
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                    Until
                  </label>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      setSchedule((s) => ({
                        ...s,
                        preset: null,
                        endTime: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-center text-lg font-semibold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Mini timeline preview */}
              <MiniTimeline
                startTime={schedule.startTime}
                endTime={schedule.endTime}
                intervalMinutes={schedule.intervalMinutes}
              />
            </CardContent>
          </Card>

          {/* Frequency */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiRepeatLine className="size-4 text-muted-foreground" />
                <CardTitle>Every</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1.5">
                {INTERVALS.map((interval) => (
                  <Button
                    key={interval.value}
                    variant={
                      schedule.intervalMinutes === interval.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="flex-1 text-xs font-semibold"
                    onClick={() =>
                      setSchedule((s) => ({
                        ...s,
                        preset: null,
                        intervalMinutes: interval.value,
                      }))
                    }
                  >
                    {interval.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart toggles */}
      <Card>
        <CardContent className="space-y-4">
          {/* Smart reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-chart-1/20">
                <RiMagicLine className="size-4 text-chart-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Smart reminders
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Skip if you recently logged
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSchedule((s) => ({
                  ...s,
                  smartReminders: !s.smartReminders,
                }))
              }
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                schedule.smartReminders ? "bg-primary" : "bg-muted"
              )}
              role="switch"
              aria-checked={schedule.smartReminders}
              aria-label="Toggle smart reminders"
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform",
                  schedule.smartReminders ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Daily summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <RiCheckLine className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Daily summary
                </p>
                <p className="text-[11px] text-muted-foreground">
                  End-of-day progress report
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSchedule((s) => ({
                  ...s,
                  dailySummary: !s.dailySummary,
                }))
              }
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                schedule.dailySummary ? "bg-primary" : "bg-muted"
              )}
              role="switch"
              aria-checked={schedule.dailySummary}
              aria-label="Toggle daily summary"
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform",
                  schedule.dailySummary ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Summary footer */}
      <div className="rounded-xl bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Per day</span>
          <span className="font-medium text-foreground">
            ~{remindersPerDay} reminders
            {schedule.dailySummary ? " + summary" : ""}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Per week</span>
          <span className="font-medium text-foreground">
            ~{weeklyTotal} across {schedule.activeDays.length} days
          </span>
        </div>
      </div>
    </div>
  );
}
