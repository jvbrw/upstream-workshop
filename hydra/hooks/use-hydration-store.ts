import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { HydrationLog } from "@/lib/types";
import { DEFAULT_GOAL, DEFAULT_PRESETS, STORAGE_KEY } from "@/lib/constants";
import type { StateStorage } from "zustand/middleware";

// --- Schema validation ---

function isValidLog(log: unknown): log is HydrationLog {
  if (typeof log !== "object" || log === null) return false;
  const l = log as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    l.id.length > 0 &&
    typeof l.amount === "number" &&
    l.amount > 0 &&
    typeof l.timestamp === "string" &&
    !isNaN(Date.parse(l.timestamp))
  );
}

function isValidPersistedState(
  state: unknown
): state is { logs: HydrationLog[]; dailyGoal: number; presets: number[] } {
  if (typeof state !== "object" || state === null) return false;
  const s = state as Record<string, unknown>;
  if (!Array.isArray(s.logs) || !s.logs.every(isValidLog)) return false;
  if (typeof s.dailyGoal !== "number" || s.dailyGoal <= 0) return false;
  if (
    !Array.isArray(s.presets) ||
    !s.presets.every((p) => typeof p === "number" && p > 0)
  )
    return false;
  return true;
}

// --- Safe localStorage wrapper ---

let _isEphemeral = false;
let _quotaExceeded = false;

function createSafeStorage(): StateStorage {
  const isAvailable = (() => {
    try {
      const key = "__hydra_storage_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  })();

  if (!isAvailable) {
    _isEphemeral = true;
  }

  return {
    getItem: (name) => {
      if (!isAvailable) return null;
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (!isAvailable) return;
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          _isEphemeral = true;
          _quotaExceeded = true;
        }
      }
    },
    removeItem: (name) => {
      if (!isAvailable) return;
      try {
        localStorage.removeItem(name);
      } catch {
        // silently fail
      }
    },
  };
}

const safeStorage = createSafeStorage();

// --- Store ---

type HydrationState = {
  // Persisted
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];

  // Internal (not persisted)
  _hydrated: boolean;
  _dataWasReset: boolean;

  // Actions
  addLog: (amount: number) => void;
  deleteLog: (id: string) => void;
  editLog: (id: string, newAmount: number) => void;
  setDailyGoal: (goal: number) => void;
  setPresets: (presets: number[]) => void;
  clearAllData: () => void;
  _clearResetFlag: () => void;
};

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      logs: [],
      dailyGoal: DEFAULT_GOAL,
      presets: DEFAULT_PRESETS,

      _hydrated: false,
      _dataWasReset: false,

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

      _clearResetFlag: () => set({ _dataWasReset: false }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        logs: state.logs,
        dailyGoal: state.dailyGoal,
        presets: state.presets,
      }),
      merge: (persistedState, currentState) => {
        if (isValidPersistedState(persistedState)) {
          return {
            ...currentState,
            logs: persistedState.logs,
            dailyGoal: persistedState.dailyGoal,
            presets: persistedState.presets,
          };
        }
        // Invalid data — reset to defaults
        if (persistedState !== undefined) {
          return { ...currentState, _dataWasReset: true };
        }
        return currentState;
      },
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state._hydrated = true;
          }
        };
      },
    }
  )
);

// --- Public hooks ---

export function useStoreHydrated() {
  return useHydrationStore((s) => s._hydrated);
}

export function useIsEphemeral() {
  return _isEphemeral;
}

export function useQuotaExceeded() {
  return _quotaExceeded;
}

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

      // TODO [Phase 2]: Implement "forward-only" goal changes.
      // MVP limitation: current dailyGoal is applied retroactively to all
      // historical days. Changing the goal recalculates the entire streak.
      // To fix: store goal change history or daily snapshots.
      if (total >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [logs, dailyGoal]);
}
