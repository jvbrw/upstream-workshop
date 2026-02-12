export type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string;
};

export type Tab = "today" | "history" | "manage";

export type DayGroup = {
  date: string;
  label: string;
  logs: HydrationLog[];
  total: number;
};
