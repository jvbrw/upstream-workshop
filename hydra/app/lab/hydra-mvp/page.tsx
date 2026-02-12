"use client";

import { useState, useCallback } from "react";
import {
  RiDropLine,
  RiBarChartBoxLine,
  RiFileList3Line,
} from "@remixicon/react";
import { TodayView } from "./components/today-view";
import { HistoryView } from "./components/history-view";
import { ManageView } from "./components/manage-view";
import { ThemeToggle } from "./components/theme-toggle";
import type { HydrationLog, Tab } from "./types";
import { generateMockData, DEFAULT_GOAL } from "./mock-data";

const TABS: { id: Tab; label: string; icon: typeof RiDropLine }[] = [
  { id: "today", label: "Today", icon: RiDropLine },
  { id: "history", label: "History", icon: RiBarChartBoxLine },
  { id: "manage", label: "Manage", icon: RiFileList3Line },
];

function calculateStreak(logs: HydrationLog[], goal: number): number {
  const dayMap = new Map<string, number>();

  logs.forEach((log) => {
    const day = new Date(log.timestamp).toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + log.amount);
  });

  let streak = 0;
  const today = new Date();

  // Check if today is already at goal — if so, count it
  const todayKey = today.toISOString().split("T")[0];
  const todayTotal = dayMap.get(todayKey) ?? 0;

  // Start counting from yesterday (today is in progress)
  const startFrom = todayTotal >= goal ? 0 : 1;

  for (let i = startFrom; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const total = dayMap.get(key) ?? 0;

    if (total >= goal) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function HydraMvpPage() {
  const [logs, setLogs] = useState<HydrationLog[]>(() => generateMockData());
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const dailyGoal = DEFAULT_GOAL;

  const streak = calculateStreak(logs, dailyGoal);

  const handleLog = useCallback((amount: number) => {
    const newLog: HydrationLog = {
      id: `log-${Date.now()}`,
      amount,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  const handleEdit = useCallback((id: string, newAmount: number) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, amount: newAmount } : log))
    );
  }, []);

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-background font-sans">
      {/* Theme toggle */}
      <div className="flex justify-end px-2 pt-2">
        <ThemeToggle />
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === "today" && (
          <TodayView
            logs={logs}
            dailyGoal={dailyGoal}
            streak={streak}
            onLog={handleLog}
          />
        )}
        {activeTab === "history" && (
          <HistoryView logs={logs} dailyGoal={dailyGoal} />
        )}
        {activeTab === "manage" && (
          <ManageView logs={logs} onDelete={handleDelete} onEdit={handleEdit} />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
