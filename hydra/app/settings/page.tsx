"use client";

import { useState } from "react";
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

const GOAL_OPTIONS = [1500, 2000, 2500, 3000, 3500];

export default function SettingsPage() {
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  const presets = useHydrationStore((s) => s.presets);
  const logs = useHydrationStore((s) => s.logs);
  const setDailyGoal = useHydrationStore((s) => s.setDailyGoal);
  const setPresets = useHydrationStore((s) => s.setPresets);
  const clearAllData = useHydrationStore((s) => s.clearAllData);

  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPreset, setNewPreset] = useState("250");

  function handleAddPreset() {
    const amount = parseInt(newPreset, 10);
    if (amount > 0 && amount <= 5000 && !presets.includes(amount)) {
      setPresets([...presets, amount].sort((a, b) => a - b));
      setShowAddPreset(false);
      setNewPreset("250");
    }
  }

  function handleRemovePreset(amount: number) {
    if (presets.length > 1) {
      setPresets(presets.filter((p) => p !== amount));
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your hydration goals
        </p>
      </div>

      {/* Daily Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Daily goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <Button
                key={goal}
                variant={dailyGoal === goal ? "default" : "outline"}
                className="h-12 text-base font-semibold"
                onClick={() => setDailyGoal(goal)}
              >
                {goal >= 1000 ? `${goal / 1000}L` : `${goal}ml`}
              </Button>
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
            onClick={() => setShowAddPreset(!showAddPreset)}
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
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number"
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                className="h-10 w-24 rounded-lg border border-input bg-transparent px-3 text-center font-semibold outline-none focus:border-primary"
                min={1}
                max={5000}
                autoFocus
              />
              <span className="text-sm text-muted-foreground">ml</span>
              <Button size="icon" variant="default" onClick={handleAddPreset}>
                <RiCheckLine className="size-4" />
              </Button>
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
