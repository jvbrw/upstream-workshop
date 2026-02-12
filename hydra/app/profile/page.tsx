"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  RiUser3Line,
  RiShieldCheckLine,
  RiCloudLine,
  RiNotification3Line,
  RiTimeLine,
  RiFileList3Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiAddLine,
  RiCloseLine,
  RiArrowRightSLine,
  RiLogoutBoxRLine,
} from "@remixicon/react";
import { useHydrationStore } from "@/hooks/use-hydration-store";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const GOAL_OPTIONS = [1500, 2000, 2500, 3000, 3500];

export default function ProfilePage() {
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  const presets = useHydrationStore((s) => s.presets);
  const logs = useHydrationStore((s) => s.logs);
  const setDailyGoal = useHydrationStore((s) => s.setDailyGoal);
  const setPresets = useHydrationStore((s) => s.setPresets);
  const clearAllData = useHydrationStore((s) => s.clearAllData);

  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPreset, setNewPreset] = useState("250");
  const [remindersOn, setRemindersOn] = useState(true);

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Account &amp; preferences
        </p>
      </div>

      {/* Account card */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                <RiUser3Line className="size-6 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                <RiShieldCheckLine className="size-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-foreground">
                Ana Costa
              </p>
              <p className="text-sm text-muted-foreground">
                ana.costa@gmail.com
              </p>
            </div>
          </div>

          {/* Sync status */}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2">
            <RiCloudLine className="size-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">
              Synced across devices
            </span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Just now
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <RiNotification3Line className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Reminders</p>
              <p className="text-xs text-muted-foreground">
                {remindersOn ? (
                  <>
                    <RiTimeLine className="mr-0.5 mb-px inline size-3" />
                    8:00 AM – 10:00 PM · Every hour
                  </>
                ) : (
                  "Off"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setRemindersOn(!remindersOn)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              remindersOn ? "bg-primary" : "bg-muted"
            }`}
            role="switch"
            aria-checked={remindersOn}
            aria-label="Toggle reminders"
          >
            <span
              className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform ${
                remindersOn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </CardContent>
      </Card>

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
                className="h-11 text-sm font-semibold"
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

      {/* Manage entries link */}
      <Link href="/manage">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <RiFileList3Line className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Manage entries
                </p>
                <p className="text-xs text-muted-foreground">
                  Edit or delete past logs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary">{logs.length}</Badge>
              <RiArrowRightSLine className="size-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Appearance */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Appearance</CardTitle>
          <ThemeToggle />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark mode
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
              <p className="text-sm font-medium text-foreground">Storage</p>
              <p className="text-xs text-muted-foreground">
                Cloud + local backup
              </p>
            </div>
            <Badge variant="secondary">Cloud</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Total entries
              </p>
              <p className="text-xs text-muted-foreground">
                Since Feb 2026
              </p>
            </div>
            <Badge variant="secondary">{logs.length}</Badge>
          </div>
          <Separator />
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
                  your daily goal, and restore default presets.
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

      {/* Sign out */}
      <Button variant="outline" className="w-full gap-2 text-destructive">
        <RiLogoutBoxRLine className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
