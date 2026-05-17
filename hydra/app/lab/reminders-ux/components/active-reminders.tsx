"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiNotification3Line,
  RiNotificationOffLine,
  RiTimeLine,
  RiCheckLine,
  RiDropLine,
  RiZzzLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

type SnoozeState = "active" | "snoozed-1h" | "snoozed-today";

const TIMELINE_ITEMS = [
  {
    time: "3:00 PM",
    status: "upcoming" as const,
    text: "Hydration reminder",
  },
  {
    time: "2:00 PM",
    status: "sent" as const,
    text: "Time to hydrate! You're at 1.4L — 600ml to go.",
    acted: true,
  },
  {
    time: "1:00 PM",
    status: "sent" as const,
    text: "Quick sip? You're at 1.1L.",
    acted: false,
  },
  {
    time: "12:00 PM",
    status: "skipped" as const,
    text: "Skipped — you logged 300ml 5 min ago.",
    acted: false,
  },
  {
    time: "11:00 AM",
    status: "sent" as const,
    text: "Morning check: 600ml logged.",
    acted: true,
  },
  {
    time: "10:00 AM",
    status: "sent" as const,
    text: "Keep it up! 300ml so far.",
    acted: true,
  },
  {
    time: "9:00 AM",
    status: "sent" as const,
    text: "Good morning! Start your day hydrated.",
    acted: true,
  },
];

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export function ActiveReminders() {
  const [snooze, setSnooze] = useState<SnoozeState>("active");
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [countdown, setCountdown] = useState(23 * 60); // 23 minutes in seconds

  // Simulated countdown
  useEffect(() => {
    if (snooze !== "active") return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 23 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [snooze]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const progress = ((23 * 60 - countdown) / (23 * 60)) * 100;

  // Stats
  const sentCount = TIMELINE_ITEMS.filter(
    (i) => i.status === "sent"
  ).length;
  const actedCount = TIMELINE_ITEMS.filter(
    (i) => i.status === "sent" && i.acted
  ).length;
  const skippedCount = TIMELINE_ITEMS.filter(
    (i) => i.status === "skipped"
  ).length;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground">
            {snooze === "active"
              ? "Active — 8am to 10pm"
              : snooze === "snoozed-1h"
                ? "Snoozed for 1 hour"
                : "Snoozed until tomorrow"}
          </p>
        </div>
      </div>

      {/* Countdown hero */}
      <Card className={cn(snooze !== "active" && "opacity-50")}>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Circular countdown */}
            <div className="relative shrink-0">
              <CircularProgress
                value={snooze === "active" ? progress : 0}
                size={100}
                strokeWidth={6}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {snooze === "active" ? (
                  <>
                    <span className="text-xl font-bold tabular-nums text-foreground">
                      {minutes}:{seconds.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      minutes
                    </span>
                  </>
                ) : (
                  <RiZzzLine className="size-8 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Next reminder
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {snooze === "active"
                  ? "3:00 PM"
                  : snooze === "snoozed-1h"
                    ? "Resumes at 4:00 PM"
                    : "Resumes tomorrow"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {snooze === "active"
                  ? `${sentCount} sent today, ${8 - sentCount} remaining`
                  : "All upcoming reminders paused"}
              </p>

              {/* Snooze button */}
              <div className="relative mt-3">
                <Button
                  variant={snooze === "active" ? "outline" : "default"}
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    if (snooze !== "active") {
                      setSnooze("active");
                      setShowSnoozeMenu(false);
                    } else {
                      setShowSnoozeMenu(!showSnoozeMenu);
                    }
                  }}
                >
                  {snooze === "active" ? (
                    <>
                      <RiZzzLine className="size-3.5" />
                      Snooze
                    </>
                  ) : (
                    <>
                      <RiNotification3Line className="size-3.5" />
                      Resume
                    </>
                  )}
                </Button>

                {/* Snooze dropdown */}
                {showSnoozeMenu && (
                  <div className="absolute top-full left-0 z-10 mt-1.5 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                    <button
                      onClick={() => {
                        setSnooze("snoozed-1h");
                        setShowSnoozeMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      <RiTimeLine className="size-4 text-muted-foreground" />
                      For 1 hour
                    </button>
                    <button
                      onClick={() => {
                        setSnooze("snoozed-today");
                        setShowSnoozeMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      <RiNotificationOffLine className="size-4 text-muted-foreground" />
                      Until tomorrow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-0.5 rounded-xl bg-primary/5 px-3 py-2.5">
          <span className="text-lg font-bold text-primary">{sentCount}</span>
          <span className="text-[10px] text-muted-foreground">Sent</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-xl bg-emerald-500/5 px-3 py-2.5">
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {actedCount}
          </span>
          <span className="text-[10px] text-muted-foreground">Acted on</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-xl bg-muted/50 px-3 py-2.5">
          <span className="text-lg font-bold text-muted-foreground">
            {skippedCount}
          </span>
          <span className="text-[10px] text-muted-foreground">Smart skip</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Today
        </p>

        {TIMELINE_ITEMS.map((item) => (
          <div
            key={item.time}
            className={cn(
              "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
              item.status === "upcoming" && "bg-primary/5"
            )}
          >
            {/* Icon */}
            <div className="mt-0.5">
              {item.status === "upcoming" ? (
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <RiTimeLine className="size-3.5 text-primary" />
                </div>
              ) : item.status === "skipped" ? (
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <RiCheckLine className="size-3.5 text-muted-foreground" />
                </div>
              ) : item.acted ? (
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <RiDropLine className="size-3.5 text-emerald-500" />
                </div>
              ) : (
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <RiNotification3Line className="size-3.5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.status === "upcoming"
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {item.time}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    item.status === "upcoming"
                      ? "font-medium text-primary"
                      : item.status === "skipped"
                        ? "text-muted-foreground"
                        : item.acted
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                  )}
                >
                  {item.status === "upcoming"
                    ? "Next"
                    : item.status === "skipped"
                      ? "Skipped"
                      : item.acted
                        ? "Logged"
                        : "Sent"}
                </span>
              </div>
              <p
                className={cn(
                  "text-xs",
                  item.status === "upcoming"
                    ? "text-primary/70"
                    : "text-muted-foreground"
                )}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
