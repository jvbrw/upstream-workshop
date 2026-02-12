import type { HydrationLog } from "./types";

export function generateMockData(): HydrationLog[] {
  const logs: HydrationLog[] = [];
  const now = new Date();
  const amounts = [200, 250, 300, 350, 500];
  const entriesPerDay = [5, 7, 4, 8, 6, 3, 7, 6, 5, 8, 4, 7, 6, 3];

  for (let day = 13; day >= 1; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    const count = entriesPerDay[day] ?? 5;

    for (let i = 0; i < count; i++) {
      const hour = 7 + Math.floor((i * 14) / count);
      const minute = (i * 17 + day * 11) % 60;

      const entryDate = new Date(date);
      entryDate.setHours(hour, minute, 0, 0);

      logs.push({
        id: `mock-${day}-${i}`,
        amount: amounts[(day + i) % amounts.length],
        timestamp: entryDate.toISOString(),
      });
    }
  }

  // Today: 3 entries so far (not at goal yet — room to interact)
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const todayEntries = [
    { hour: 7, minute: 15, amount: 300 },
    { hour: 9, minute: 45, amount: 500 },
    { hour: 12, minute: 10, amount: 250 },
  ];

  todayEntries.forEach((entry, i) => {
    const entryDate = new Date(today);
    entryDate.setHours(entry.hour, entry.minute, 0, 0);
    logs.push({
      id: `today-${i}`,
      amount: entry.amount,
      timestamp: entryDate.toISOString(),
    });
  });

  return logs;
}

export const DEFAULT_GOAL = 2000;
export const PRESETS = [200, 300, 500];
