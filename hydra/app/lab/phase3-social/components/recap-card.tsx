"use client";

import { forwardRef } from "react";
import { RiDropLine, RiFireLine } from "@remixicon/react";

export type RecapCardProps = {
  weekLabel: string;
  dailyTotals: number[];
  goal: number;
  streak: number;
};

export const RecapCard = forwardRef<HTMLDivElement, RecapCardProps>(
  function RecapCard({ weekLabel, dailyTotals, goal, streak }, ref) {
    const weekTotal = dailyTotals.reduce((a, b) => a + b, 0);
    const average = weekTotal / dailyTotals.length;
    const bestDay = Math.max(...dailyTotals);
    const daysOnGoal = dailyTotals.filter((d) => d >= goal).length;
    const maxBar = Math.max(bestDay, goal);

    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div
        ref={ref}
        className="relative flex aspect-[9/16] w-[320px] flex-col items-center justify-between overflow-hidden rounded-3xl px-7 py-9"
        style={{
          background:
            "linear-gradient(165deg, oklch(0.16 0.05 220) 0%, oklch(0.10 0.03 240) 50%, oklch(0.07 0.02 260) 100%)",
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.50 0.12 210 / 0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Top: Logo + week */}
        <div className="z-10 flex w-full flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <RiDropLine className="size-5" style={{ color: "oklch(0.9 0.06 210)" }} />
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: "oklch(0.9 0.06 210)" }}
            >
              hydra
            </span>
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "oklch(0.65 0.03 240)" }}
          >
            Weekly Recap
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "oklch(0.55 0.02 260)" }}
          >
            {weekLabel}
          </span>
        </div>

        {/* Chart */}
        <div className="z-10 flex w-full flex-col gap-3">
          <div className="flex items-end justify-between gap-2 px-1" style={{ height: 120 }}>
            {dailyTotals.map((total, i) => {
              const h = (total / maxBar) * 100;
              const metGoal = total >= goal;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${h}%`,
                      minHeight: 4,
                      background: metGoal
                        ? "oklch(0.72 0.19 160)"
                        : "oklch(0.35 0.04 220)",
                    }}
                  />
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: "oklch(0.55 0.02 260)" }}
                  >
                    {DAYS[i]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Goal line indicator */}
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1" style={{ background: "oklch(0.72 0.19 160 / 0.3)", borderTop: "1px dashed oklch(0.72 0.19 160 / 0.4)" }} />
            <span className="text-[9px] font-medium" style={{ color: "oklch(0.72 0.19 160 / 0.6)" }}>
              {(goal / 1000).toFixed(1)}L goal
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="z-10 w-full">
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Total" value={`${(weekTotal / 1000).toFixed(1)}L`} />
            <StatItem label="Average" value={`${(average / 1000).toFixed(1)}L/day`} />
            <StatItem label="Best day" value={`${(bestDay / 1000).toFixed(1)}L`} />
            <StatItem label="Days on goal" value={`${daysOnGoal}/7`} />
          </div>

          {/* Streak */}
          <div
            className="mt-3 flex items-center justify-center gap-2 rounded-full py-1.5"
            style={{ background: "oklch(0.25 0.04 40 / 0.5)" }}
          >
            <RiFireLine className="size-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">
              {streak} day streak
            </span>
          </div>
        </div>

        {/* Watermark */}
        <span
          className="z-10 text-[10px] font-medium tracking-widest uppercase"
          style={{ color: "oklch(0.35 0.02 260)" }}
        >
          Tracked with Hydra
        </span>
      </div>
    );
  }
);

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-lg py-2"
      style={{ background: "oklch(0.20 0.03 240 / 0.6)" }}
    >
      <span
        className="text-sm font-bold"
        style={{ color: "oklch(0.88 0.04 210)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] font-medium"
        style={{ color: "oklch(0.55 0.02 260)" }}
      >
        {label}
      </span>
    </div>
  );
}
