"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiNotification3Line,
  RiTimeLine,
  RiPauseLine,
  RiPlayLine,
  RiSettings3Line,
  RiDropLine,
  RiMoonLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

type ReminderSchedule = {
  enabled: boolean;
  paused: boolean;
  startHour: number;
  endHour: number;
  intervalMin: number;
  dailySummary: boolean;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

function TimelineBar({
  startHour,
  endHour,
  intervalMin,
  paused,
}: {
  startHour: number;
  endHour: number;
  intervalMin: number;
  paused: boolean;
}) {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const totalMinutes = (endHour - startHour) * 60;
  const reminderCount =
    totalMinutes > 0 ? Math.floor(totalMinutes / intervalMin) : 0;

  // Generate reminder dots
  const dots = Array.from({ length: reminderCount }, (_, i) => {
    const minuteOffset = i * intervalMin;
    const hour = startHour + minuteOffset / 60;
    return { hour, pct: (hour / 24) * 100 };
  });

  return (
    <div className="space-y-2">
      {/* Timeline */}
      <div className="relative h-10">
        {/* Background track */}
        <div className="absolute inset-x-0 top-4 h-1.5 rounded-full bg-muted" />

        {/* Active window */}
        <div
          className={cn(
            "absolute top-4 h-1.5 rounded-full transition-colors",
            paused ? "bg-muted-foreground/20" : "bg-primary/30"
          )}
          style={{
            left: `${(startHour / 24) * 100}%`,
            width: `${((endHour - startHour) / 24) * 100}%`,
          }}
        />

        {/* Reminder dots */}
        {dots.map((dot, i) => (
          <div
            key={i}
            className={cn(
              "absolute top-3 size-3 -translate-x-1/2 rounded-full border-2 border-background transition-colors",
              paused ? "bg-muted-foreground/30" : "bg-primary"
            )}
            style={{ left: `${dot.pct}%` }}
          />
        ))}

        {/* Current time indicator */}
        <div
          className="absolute top-2 -translate-x-1/2"
          style={{ left: `${(currentHour / 24) * 100}%` }}
        >
          <div className="size-5 rounded-full border-2 border-foreground bg-background" />
        </div>
      </div>

      {/* Hour labels */}
      <div className="flex justify-between px-0.5">
        {[0, 6, 12, 18, 24].map((h) => (
          <span
            key={h}
            className={cn(
              "text-[10px]",
              h >= startHour && h <= endHour
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {h === 24 ? "12a" : formatHour(h)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RemindersHub() {
  const [schedule, setSchedule] = useState<ReminderSchedule>({
    enabled: true,
    paused: false,
    startHour: 8,
    endHour: 22,
    intervalMin: 60,
    dailySummary: true,
  });

  const windowMinutes = (schedule.endHour - schedule.startHour) * 60;
  const remindersPerDay =
    windowMinutes > 0 ? Math.floor(windowMinutes / schedule.intervalMin) : 0;

  // Simulated "next reminder" — always a few minutes from now for demo
  const nextReminderMin = schedule.paused ? null : 23;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground">
            {schedule.paused
              ? "Paused until tomorrow"
              : schedule.enabled
                ? `${remindersPerDay} reminders today`
                : "Currently off"}
          </p>
        </div>
        <button
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Reminder settings"
        >
          <RiSettings3Line className="size-5" />
        </button>
      </div>

      {/* Status hero card */}
      <Card
        className={cn(
          "overflow-hidden transition-colors",
          schedule.paused && "opacity-60"
        )}
      >
        <CardContent className="space-y-4">
          {/* Next reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl transition-colors",
                  schedule.paused
                    ? "bg-muted"
                    : "bg-primary/10"
                )}
              >
                {schedule.paused ? (
                  <RiMoonLine className="size-6 text-muted-foreground" />
                ) : (
                  <RiDropLine className="size-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Next reminder
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {schedule.paused
                    ? "Paused"
                    : `In ${nextReminderMin} min`}
                </p>
              </div>
            </div>

            {/* Pause/Resume */}
            <button
              onClick={() =>
                setSchedule((s) => ({ ...s, paused: !s.paused }))
              }
              className={cn(
                "flex size-11 items-center justify-center rounded-xl transition-colors",
                schedule.paused
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label={schedule.paused ? "Resume reminders" : "Pause reminders"}
            >
              {schedule.paused ? (
                <RiPlayLine className="size-5" />
              ) : (
                <RiPauseLine className="size-5" />
              )}
            </button>
          </div>

          {/* Visual timeline */}
          <TimelineBar
            startHour={schedule.startHour}
            endHour={schedule.endHour}
            intervalMin={schedule.intervalMin}
            paused={schedule.paused}
          />
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Interval",
            value:
              schedule.intervalMin >= 60
                ? `${schedule.intervalMin / 60}h`
                : `${schedule.intervalMin}m`,
            icon: RiRepeatIcon,
          },
          {
            label: "Window",
            value: `${schedule.endHour - schedule.startHour}h`,
            icon: RiTimeLine,
          },
          {
            label: "Today",
            value: `${remindersPerDay}`,
            icon: RiNotification3Line,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 px-3 py-3"
          >
            <stat.icon className="size-4 text-muted-foreground" />
            <span className="text-lg font-semibold text-foreground">
              {stat.value}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Today's activity */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Today&apos;s reminders
        </p>

        {[
          { time: "2:00 PM", status: "sent", text: "Time to hydrate! 1.4L so far." },
          { time: "1:00 PM", status: "sent", text: "Quick sip? You're at 1.1L." },
          { time: "12:00 PM", status: "sent", text: "Lunch break — don't forget water!" },
          { time: "11:00 AM", status: "sent", text: "Morning check: 600ml logged." },
          { time: "10:00 AM", status: "sent", text: "Time to hydrate! 300ml so far." },
          { time: "9:00 AM", status: "sent", text: "Good morning! Start your day hydrated." },
        ].map((item) => (
          <div
            key={item.time}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5"
          >
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <RiNotification3Line className="size-3 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {item.time}
                </span>
                <span className="text-[10px] text-emerald-500">Sent</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple repeat icon (alias since we need it in the stats array)
function RiRepeatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 4h15a1 1 0 0 1 1 1v5h-2V6H6v3L1 5.5 6 2v2zm12 16H3a1 1 0 0 1-1-1v-5h2v4h12v-3l5 3.5-5 3.5v-2z" />
    </svg>
  );
}
