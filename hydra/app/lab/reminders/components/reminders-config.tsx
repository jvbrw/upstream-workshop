"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RiNotification3Line,
  RiTimeLine,
  RiRepeatLine,
  RiCheckLine,
  RiCalendarLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

type ReminderState = {
  enabled: boolean;
  activeDays: number[]; // 0=Dom, 1=Seg, ..., 6=Sab
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  dailySummary: boolean;
};

const DAYS = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
  { value: 0, short: "Sun", label: "Sunday" },
];

const INTERVALS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function RemindersConfig() {
  const [reminder, setReminder] = useState<ReminderState>({
    enabled: true,
    activeDays: [1, 2, 3, 4, 5], // weekdays by default
    startTime: "08:00",
    endTime: "22:00",
    intervalMinutes: 60,
    dailySummary: true,
  });

  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  function handleToggle() {
    if (!reminder.enabled && permissionState === "prompt") {
      setPermissionState("granted");
    }
    setReminder((prev) => ({ ...prev, enabled: !prev.enabled }));
  }

  function toggleDay(day: number) {
    setReminder((prev) => {
      const has = prev.activeDays.includes(day);
      return {
        ...prev,
        activeDays: has
          ? prev.activeDays.filter((d) => d !== day)
          : [...prev.activeDays, day],
      };
    });
  }

  const windowMinutes =
    parseTime(reminder.endTime) - parseTime(reminder.startTime);

  const remindersPerDay =
    reminder.enabled && windowMinutes > 0
      ? Math.floor(windowMinutes / reminder.intervalMinutes)
      : 0;

  const activeDayCount = reminder.activeDays.length;

  const weeklyTotal = remindersPerDay * activeDayCount;

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
        <p className="text-sm text-muted-foreground">
          Gentle nudges to stay hydrated throughout the day
        </p>
      </div>

      {/* Master toggle */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <RiNotification3Line className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Push notifications
              </p>
              <p className="text-xs text-muted-foreground">
                {reminder.enabled
                  ? `~${remindersPerDay} reminders/day`
                  : "Currently off"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              reminder.enabled ? "bg-primary" : "bg-muted"
            )}
            role="switch"
            aria-checked={reminder.enabled}
            aria-label="Toggle push notifications"
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform",
                reminder.enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </CardContent>
      </Card>

      {reminder.enabled && (
        <>
          {/* Active days */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiCalendarLine className="size-4 text-muted-foreground" />
                <CardTitle>Active days</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1.5">
                {DAYS.map((day) => {
                  const active = reminder.activeDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      aria-label={`${active ? "Disable" : "Enable"} ${day.label}`}
                      aria-pressed={active}
                      className={cn(
                        "flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-colors",
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
              {activeDayCount === 0 && (
                <p className="mt-2 text-xs text-destructive">
                  Select at least one day to receive reminders
                </p>
              )}
            </CardContent>
          </Card>

          {/* Time window */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiTimeLine className="size-4 text-muted-foreground" />
                <CardTitle>Active hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Start
                  </label>
                  <input
                    type="time"
                    value={reminder.startTime}
                    onChange={(e) =>
                      setReminder((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-center text-lg font-semibold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <span className="mt-5 text-sm text-muted-foreground">to</span>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">
                    End
                  </label>
                  <input
                    type="time"
                    value={reminder.endTime}
                    onChange={(e) =>
                      setReminder((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-center text-lg font-semibold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frequency */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiRepeatLine className="size-4 text-muted-foreground" />
                <CardTitle>Frequency</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {INTERVALS.map((interval) => (
                  <Button
                    key={interval.value}
                    variant={
                      reminder.intervalMinutes === interval.value
                        ? "default"
                        : "outline"
                    }
                    className="h-11 text-sm font-semibold"
                    onClick={() =>
                      setReminder((prev) => ({
                        ...prev,
                        intervalMinutes: interval.value,
                      }))
                    }
                  >
                    {reminder.intervalMinutes === interval.value && (
                      <RiCheckLine className="mr-1.5 size-4" />
                    )}
                    {interval.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily summary */}
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Daily summary
                </p>
                <p className="text-xs text-muted-foreground">
                  End-of-day progress notification
                </p>
              </div>
              <button
                onClick={() =>
                  setReminder((prev) => ({
                    ...prev,
                    dailySummary: !prev.dailySummary,
                  }))
                }
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors",
                  reminder.dailySummary ? "bg-primary" : "bg-muted"
                )}
                role="switch"
                aria-checked={reminder.dailySummary}
                aria-label="Toggle daily summary"
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform",
                    reminder.dailySummary ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Notification preview
            </p>

            {/* Reminder notification */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <RiNotification3Line className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Hydra
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      now
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground">
                    Time to hydrate! You&apos;re at 1.2L — 800ml to go.
                  </p>
                </div>
              </div>
            </div>

            {/* Daily summary notification */}
            {reminder.dailySummary && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <RiCheckLine className="size-4 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Hydra — Daily Summary
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        10:00 PM
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">
                      You drank 1.8L today — 90% of your goal. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Computed summary */}
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Per day</span>
                <span className="font-medium text-foreground">
                  ~{remindersPerDay} reminders
                  {reminder.dailySummary ? " + summary" : ""}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Per week</span>
                <span className="font-medium text-foreground">
                  ~{weeklyTotal} reminders across {activeDayCount} days
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
