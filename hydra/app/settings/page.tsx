"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  RiCheckLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCloseLine,
} from "@remixicon/react";
import { useHydrationStore } from "@/hooks/use-hydration-store";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const GOAL_SHORTCUTS = [1500, 2000, 2500, 3000];

export default function SettingsPage() {
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  const presets = useHydrationStore((s) => s.presets);
  const logs = useHydrationStore((s) => s.logs);
  const setDailyGoal = useHydrationStore((s) => s.setDailyGoal);
  const setPresets = useHydrationStore((s) => s.setPresets);
  const clearAllData = useHydrationStore((s) => s.clearAllData);

  const [goalInput, setGoalInput] = useState(String(dailyGoal));
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPreset, setNewPreset] = useState("250");
  const [presetError, setPresetError] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const triggerSaved = useCallback(() => {
    setShowSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setShowSaved(false), 1500);
  }, []);

  function applyGoal(value: number) {
    const clamped = Math.round(Math.min(Math.max(value, 500), 5000) / 100) * 100;
    setGoalInput(String(clamped));
    setDailyGoal(clamped);
    triggerSaved();
  }

  function handleGoalBlur() {
    const parsed = parseInt(goalInput, 10);
    if (!isNaN(parsed)) {
      applyGoal(parsed);
    } else {
      setGoalInput(String(dailyGoal));
    }
  }

  function handleGoalKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleAddPreset() {
    const amount = parseInt(newPreset, 10);
    if (isNaN(amount) || amount < 50 || amount > 2000) {
      setPresetError("Enter 50–2000ml");
      return;
    }
    if (presets.includes(amount)) {
      setPresetError("Already exists");
      return;
    }
    setPresets([...presets, amount].sort((a, b) => a - b));
    setShowAddPreset(false);
    setNewPreset("250");
    setPresetError("");
    triggerSaved();
  }

  function handleRemovePreset(amount: number) {
    if (presets.length > 1) {
      setPresets(presets.filter((p) => p !== amount));
      triggerSaved();
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize your hydration goals
          </p>
        </div>
        {showSaved && (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <RiCheckLine className="size-4" />
            Saved
          </span>
        )}
      </div>

      {/* Daily Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Daily goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={handleGoalBlur}
              onKeyDown={handleGoalKeyDown}
              aria-label="Daily goal in milliliters"
              className="h-12 w-full rounded-lg border border-input bg-transparent px-3 text-center text-xl font-bold outline-none focus:border-primary"
              min={500}
              max={5000}
              step={100}
            />
            <span className="text-sm font-medium text-muted-foreground">ml</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GOAL_SHORTCUTS.map((goal) => (
              <button
                key={goal}
                onClick={() => applyGoal(goal)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  dailyGoal === goal
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {goal >= 1000 ? `${goal / 1000}L` : `${goal}ml`}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Quick log presets</CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setShowAddPreset(!showAddPreset);
              setPresetError("");
            }}
          >
            {showAddPreset ? (
              <RiCloseLine className="size-4" />
            ) : (
              <RiAddLine className="size-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {showAddPreset && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newPreset}
                  onChange={(e) => {
                    setNewPreset(e.target.value);
                    if (presetError) setPresetError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPreset();
                  }}
                  aria-label="New preset amount in milliliters"
                  className={`h-10 w-24 rounded-lg border bg-transparent px-3 text-center font-semibold outline-none focus:border-primary ${
                    presetError ? "border-destructive" : "border-input"
                  }`}
                  min={50}
                  max={2000}
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">ml</span>
                <Button size="icon" variant="default" onClick={handleAddPreset}>
                  <RiCheckLine className="size-4" />
                </Button>
              </div>
              {presetError && (
                <p className="mt-1 text-xs text-destructive">{presetError}</p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {presets.map((amount) => (
              <Badge
                key={amount}
                variant="secondary"
                className="gap-1.5 px-3 py-2 text-sm font-semibold"
              >
                {amount}ml
                {presets.length > 1 && (
                  <button
                    onClick={() => handleRemovePreset(amount)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    aria-label={`Remove ${amount}ml preset`}
                  >
                    <RiCloseLine className="size-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Appearance</CardTitle>
          <ThemeToggle />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark mode. Follows your system preference
            by default.
          </p>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Total entries
              </p>
              <p className="text-xs text-muted-foreground">
                Stored in your browser&apos;s local storage
              </p>
            </div>
            <Badge variant="secondary">{logs.length}</Badge>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive"
              >
                <RiDeleteBinLine className="size-4" />
                Clear all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your hydration logs, reset
                  your daily goal, and restore default presets. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={clearAllData}
                >
                  Clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
