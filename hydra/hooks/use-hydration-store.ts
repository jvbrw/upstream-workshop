import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HydrationLog } from "@/lib/types";
import { DEFAULT_GOAL, DEFAULT_PRESETS, STORAGE_KEY } from "@/lib/constants";

type HydrationState = {
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];
  addLog: (amount: number) => void;
  deleteLog: (id: string) => void;
  editLog: (id: string, newAmount: number) => void;
  setDailyGoal: (goal: number) => void;
  setPresets: (presets: number[]) => void;
  clearAllData: () => void;
};

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      logs: [],
      dailyGoal: DEFAULT_GOAL,
      presets: DEFAULT_PRESETS,

      addLog: (amount) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              amount,
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      deleteLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        })),

      editLog: (id, newAmount) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? { ...log, amount: newAmount } : log
          ),
        })),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      setPresets: (presets) => set({ presets }),

      clearAllData: () =>
        set({ logs: [], dailyGoal: DEFAULT_GOAL, presets: DEFAULT_PRESETS }),
    }),
    { name: STORAGE_KEY }
  )
);

// Derived hooks — read raw state, derive with useMemo
export function useTodayLogs() {
  const logs = useHydrationStore((s) => s.logs);

  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs
      .filter((log) => new Date(log.timestamp) >= today)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [logs]);
}

export function useTodayTotal() {
  const todayLogs = useTodayLogs();
  return useMemo(
    () => todayLogs.reduce((sum, log) => sum + log.amount, 0),
    [todayLogs]
  );
}

export function useStreak() {
  const logs = useHydrationStore((s) => s.logs);
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);

  return useMemo(() => {
    const dayMap = new Map<string, number>();

    logs.forEach((log) => {
      const day = new Date(log.timestamp).toISOString().split("T")[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + log.amount);
    });

    let streak = 0;
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];
    const todayTotal = dayMap.get(todayKey) ?? 0;
    const startFrom = todayTotal >= dailyGoal ? 0 : 1;

    for (let i = startFrom; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      const total = dayMap.get(key) ?? 0;

      if (total >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [logs, dailyGoal]);
}
