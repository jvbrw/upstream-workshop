"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  RiAddLine,
  RiFireLine,
  RiCheckLine,
  RiCloseLine,
  RiDropLine,
} from "@remixicon/react";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { GoalCelebration } from "@/components/dashboard/goal-celebration";
import {
  useHydrationStore,
  useTodayLogs,
  useTodayTotal,
  useStreak,
} from "@/hooks/use-hydration-store";

export default function TodayPage() {
  const addLog = useHydrationStore((s) => s.addLog);
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  const presets = useHydrationStore((s) => s.presets);
  const todayLogs = useTodayLogs();
  const todayTotal = useTodayTotal();
  const streak = useStreak();

  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("350");
  const [customError, setCustomError] = useState("");
  const [lastLogged, setLastLogged] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevGoalReached = useRef(false);

  const goalReached = todayTotal >= dailyGoal;

  useEffect(() => {
    if (goalReached && !prevGoalReached.current) {
      setShowCelebration(true);
    }
    prevGoalReached.current = goalReached;
  }, [goalReached]);

  function handleLog(amount: number) {
    addLog(amount);
    setLastLogged(amount);
    setShowCustom(false);
    setTimeout(() => setLastLogged(null), 1500);
  }

  function handleCustomLog() {
    const amount = parseInt(customAmount, 10);
    if (amount > 0 && amount <= 5000) {
      setCustomError("");
      handleLog(amount);
    } else {
      setCustomError("Enter 1–5000ml");
    }
  }

  function closeCustom() {
    setShowCustom(false);
    setCustomError("");
  }

  const today = new Date();

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-2 pb-4">
      {showCelebration && (
        <GoalCelebration
          consumed={todayTotal}
          goal={dailyGoal}
          streak={streak}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Today</h1>
          <p className="text-sm text-muted-foreground">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        {streak > 0 && (
          <Link href="/social">
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
              <RiFireLine className="size-4 text-orange-500" />
              {streak} day{streak !== 1 ? "s" : ""}
            </Badge>
          </Link>
        )}
      </div>

      {/* Progress Ring */}
      <div className="relative py-2">
        <ProgressRing current={todayTotal} goal={dailyGoal} size={200} />
        {lastLogged && (
          <div className="motion-safe:animate-bounce absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            +{lastLogged}ml
          </div>
        )}
      </div>

      {/* Quick Log */}
      <div className="w-full space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Quick log</p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="h-12 flex-col gap-0 text-base font-semibold"
              onClick={() => handleLog(amount)}
            >
              {amount}
              <span className="text-[10px] font-normal text-muted-foreground">
                ml
              </span>
            </Button>
          ))}
          <Button
            variant={showCustom ? "default" : "outline"}
            className="h-12"
            onClick={() => (showCustom ? closeCustom() : setShowCustom(true))}
          >
            <RiAddLine className="size-5" />
          </Button>
        </div>

        {showCustom && (
          <Card size="sm">
            <CardContent className="flex items-center gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (customError) setCustomError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomLog();
                  if (e.key === "Escape") closeCustom();
                }}
                aria-label="Custom amount in milliliters"
                className={`h-10 w-full rounded-lg border bg-transparent px-3 text-center text-lg font-semibold outline-none focus:border-primary ${
                  customError ? "border-destructive" : "border-input"
                }`}
                min={1}
                max={5000}
                autoFocus
              />
              <span className="text-sm text-muted-foreground">ml</span>
              <Button
                size="icon"
                variant="default"
                onClick={handleCustomLog}
                className="shrink-0"
              >
                <RiCheckLine className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={closeCustom}
                className="shrink-0"
              >
                <RiCloseLine className="size-4" />
              </Button>
            </CardContent>
            {customError && (
              <p className="px-3 pb-2 text-xs text-destructive">{customError}</p>
            )}
          </Card>
        )}
      </div>

      {/* Today's Entries */}
      {todayLogs.length > 0 ? (
        <div className="w-full space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Today&apos;s entries
          </p>
          <div className="space-y-1">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
              >
                <span className="font-medium text-foreground">
                  {log.amount}ml
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <RiDropLine className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">No entries yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tap a preset above to log your first glass
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
