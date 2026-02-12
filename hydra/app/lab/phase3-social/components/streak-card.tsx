"use client";

import { forwardRef } from "react";
import { RiFireLine, RiDropLine } from "@remixicon/react";

export type StreakCardProps = {
  streak: number;
  todayConsumed: number;
  todayGoal: number;
};

const MESSAGES: Record<string, string> = {
  "1": "Every streak starts with day one.",
  "3": "Three days strong. Momentum is building.",
  "7": "A full week! Habits are forming.",
  "14": "Two weeks of consistency. Respect.",
  "30": "30 days. This isn't luck, it's discipline.",
  default: "Keep the fire alive.",
};

function getMessage(streak: number): string {
  if (streak >= 30) return MESSAGES["30"];
  if (streak >= 14) return MESSAGES["14"];
  if (streak >= 7) return MESSAGES["7"];
  if (streak >= 3) return MESSAGES["3"];
  if (streak >= 1) return MESSAGES["1"];
  return MESSAGES["default"];
}

export const StreakCard = forwardRef<HTMLDivElement, StreakCardProps>(
  function StreakCard({ streak, todayConsumed, todayGoal }, ref) {
    const message = getMessage(streak);
    const progress = Math.min(todayConsumed / todayGoal, 1);
    const liters = (todayConsumed / 1000).toFixed(1);
    const goalLiters = (todayGoal / 1000).toFixed(1);

    return (
      <div
        ref={ref}
        className="relative flex w-[320px] flex-col items-center gap-6 overflow-hidden rounded-3xl px-8 py-10"
        style={{
          aspectRatio: "9 / 16",
          background:
            "linear-gradient(165deg, oklch(0.2 0.06 30) 0%, oklch(0.13 0.04 20) 50%, oklch(0.08 0.02 15) 100%)",
        }}
      >
        {/* Fire glow */}
        <div
          className="pointer-events-none absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.55 0.18 40 / 0.2) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Logo */}
        <div className="z-10 flex items-center gap-2">
          <RiDropLine className="size-5" style={{ color: "oklch(0.8 0.06 30)" }} />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: "oklch(0.8 0.06 30)" }}
          >
            hydra
          </span>
        </div>

        {/* Streak number */}
        <div className="z-10 flex flex-1 flex-col items-center justify-center gap-3">
          <RiFireLine
            className="size-16"
            style={{ color: "oklch(0.75 0.2 45)" }}
          />
          <div className="flex flex-col items-center">
            <span
              className="text-7xl font-extrabold tabular-nums leading-none"
              style={{ color: "oklch(0.9 0.12 45)" }}
            >
              {streak}
            </span>
            <span
              className="mt-1 text-lg font-semibold uppercase tracking-wider"
              style={{ color: "oklch(0.65 0.06 40)" }}
            >
              day streak
            </span>
          </div>

          {/* Message */}
          <p
            className="mt-2 max-w-[240px] text-center text-base font-medium italic"
            style={{ color: "oklch(0.7 0.05 35)" }}
          >
            &ldquo;{message}&rdquo;
          </p>
        </div>

        {/* Today's progress mini */}
        <div className="z-10 flex w-full flex-col items-center gap-2">
          <div className="flex w-full items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "oklch(0.25 0.03 30)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress * 100}%`,
                  background: "oklch(0.72 0.19 160)",
                }}
              />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.65 0.04 30)" }}
            >
              {liters}L / {goalLiters}L
            </span>
          </div>

          {/* Watermark */}
          <span
            className="mt-3 text-[10px] font-medium tracking-widest uppercase"
            style={{ color: "oklch(0.35 0.02 30)" }}
          >
            Tracked with Hydra
          </span>
        </div>
      </div>
    );
  }
);
