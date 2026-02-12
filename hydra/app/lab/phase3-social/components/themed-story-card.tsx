"use client";

import { forwardRef } from "react";
import { RiFireLine, RiDropLine } from "@remixicon/react";

export type Theme = "dark" | "light" | "neon" | "ocean";

export type ThemedStoryCardProps = {
  consumed: number;
  goal: number;
  streak: number;
  date: Date;
  theme: Theme;
};

const THEME_STYLES: Record<
  Theme,
  {
    bg: string;
    glow: string;
    logo: string;
    date: string;
    ring: { track: string; fill: string };
    value: string;
    sub: string;
    streakBg: string;
    streakIcon: string;
    streakText: string;
    quote: string;
    watermark: string;
  }
> = {
  dark: {
    bg: "linear-gradient(165deg, oklch(0.18 0.04 230) 0%, oklch(0.12 0.03 260) 40%, oklch(0.08 0.02 270) 100%)",
    glow: "radial-gradient(circle, oklch(0.55 0.14 210 / 0.2) 0%, transparent 70%)",
    logo: "oklch(0.9 0.06 210)",
    date: "oklch(0.65 0.03 260)",
    ring: { track: "oklch(0.25 0.02 260)", fill: "oklch(0.72 0.19 160)" },
    value: "oklch(0.72 0.19 160)",
    sub: "oklch(0.75 0.03 260)",
    streakBg: "oklch(0.25 0.04 40 / 0.5)",
    streakIcon: "text-orange-400",
    streakText: "text-orange-300",
    quote: "oklch(0.78 0.05 210)",
    watermark: "oklch(0.4 0.02 260)",
  },
  light: {
    bg: "linear-gradient(165deg, oklch(0.98 0.005 260) 0%, oklch(0.96 0.01 210) 100%)",
    glow: "radial-gradient(circle, oklch(0.85 0.08 210 / 0.15) 0%, transparent 70%)",
    logo: "oklch(0.35 0.06 210)",
    date: "oklch(0.55 0.02 260)",
    ring: { track: "oklch(0.92 0.01 260)", fill: "oklch(0.55 0.15 210)" },
    value: "oklch(0.35 0.10 210)",
    sub: "oklch(0.55 0.02 260)",
    streakBg: "oklch(0.95 0.02 40)",
    streakIcon: "text-orange-500",
    streakText: "text-orange-600",
    quote: "oklch(0.45 0.04 210)",
    watermark: "oklch(0.78 0.01 260)",
  },
  neon: {
    bg: "linear-gradient(165deg, oklch(0.10 0.02 300) 0%, oklch(0.06 0.03 320) 50%, oklch(0.08 0.02 280) 100%)",
    glow: "radial-gradient(circle, oklch(0.65 0.25 150 / 0.2) 0%, transparent 70%)",
    logo: "oklch(0.85 0.2 150)",
    date: "oklch(0.6 0.03 300)",
    ring: { track: "oklch(0.2 0.03 300)", fill: "oklch(0.78 0.22 150)" },
    value: "oklch(0.78 0.22 150)",
    sub: "oklch(0.65 0.03 300)",
    streakBg: "oklch(0.2 0.06 350 / 0.6)",
    streakIcon: "text-pink-400",
    streakText: "text-pink-300",
    quote: "oklch(0.75 0.1 150)",
    watermark: "oklch(0.35 0.03 300)",
  },
  ocean: {
    bg: "linear-gradient(165deg, oklch(0.25 0.08 210) 0%, oklch(0.18 0.06 220) 40%, oklch(0.12 0.04 230) 100%)",
    glow: "radial-gradient(circle, oklch(0.55 0.12 190 / 0.25) 0%, transparent 70%)",
    logo: "oklch(0.85 0.1 190)",
    date: "oklch(0.6 0.05 210)",
    ring: { track: "oklch(0.28 0.04 210)", fill: "oklch(0.7 0.15 190)" },
    value: "oklch(0.7 0.15 190)",
    sub: "oklch(0.65 0.04 210)",
    streakBg: "oklch(0.3 0.05 40 / 0.5)",
    streakIcon: "text-amber-400",
    streakText: "text-amber-300",
    quote: "oklch(0.75 0.07 190)",
    watermark: "oklch(0.4 0.03 210)",
  },
};

const MESSAGES = [
  "Hydration goal crushed!",
  "Another day, another goal!",
  "Consistency is the real flex.",
  "Your body thanks you.",
];

export const ThemedStoryCard = forwardRef<HTMLDivElement, ThemedStoryCardProps>(
  function ThemedStoryCard({ consumed, goal, streak, date, theme }, ref) {
    const s = THEME_STYLES[theme];
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const liters = (consumed / 1000).toFixed(1);
    const goalLiters = (goal / 1000).toFixed(1);
    const message = MESSAGES[streak % MESSAGES.length];
    const progress = Math.min(consumed / goal, 1);

    const ringSize = 200;
    const sw = 12;
    const r = (ringSize - sw) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - progress);

    return (
      <div
        ref={ref}
        className="relative flex aspect-[9/16] w-[320px] flex-col items-center justify-between overflow-hidden rounded-3xl px-7 py-9"
        style={{ background: s.bg }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: s.glow,
            filter: "blur(40px)",
          }}
        />

        {/* Ocean wave decoration */}
        {theme === "ocean" && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-[120px] opacity-20">
            <svg viewBox="0 0 320 120" fill="none" className="h-full w-full">
              <path
                d="M0 60 Q40 20 80 50 T160 40 T240 55 T320 35 V120 H0Z"
                fill="oklch(0.55 0.12 190 / 0.4)"
              />
              <path
                d="M0 80 Q50 50 100 70 T200 55 T320 65 V120 H0Z"
                fill="oklch(0.45 0.10 200 / 0.3)"
              />
            </svg>
          </div>
        )}

        {/* Neon border accent */}
        {theme === "neon" && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              border: "1px solid oklch(0.78 0.22 150 / 0.3)",
              boxShadow:
                "inset 0 0 40px oklch(0.78 0.22 150 / 0.05), 0 0 20px oklch(0.78 0.22 150 / 0.1)",
            }}
          />
        )}

        {/* Top: Logo + date */}
        <div className="z-10 flex w-full flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <RiDropLine className="size-5" style={{ color: s.logo }} />
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: s.logo }}
            >
              hydra
            </span>
          </div>
          <span className="text-xs font-medium" style={{ color: s.date }}>
            {formattedDate}
          </span>
        </div>

        {/* Center: Ring */}
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                fill="none"
                strokeWidth={sw}
                style={{ stroke: s.ring.track }}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                fill="none"
                strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ stroke: s.ring.fill }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl font-bold"
                style={{ color: s.value }}
              >
                {liters}L
              </span>
              <span
                className="mt-0.5 text-xs font-medium"
                style={{ color: s.sub }}
              >
                of {goalLiters}L
              </span>
            </div>
          </div>

          {/* Streak */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: s.streakBg }}
          >
            <RiFireLine className={`size-4 ${s.streakIcon}`} />
            <span className={`text-sm font-semibold ${s.streakText}`}>
              {streak} day streak
            </span>
          </div>
        </div>

        {/* Bottom: Quote + watermark */}
        <div className="z-10 flex flex-col items-center gap-3">
          <p
            className="text-center text-base font-medium italic"
            style={{ color: s.quote }}
          >
            &ldquo;{message}&rdquo;
          </p>
          <span
            className="text-[10px] font-medium tracking-widest uppercase"
            style={{ color: s.watermark }}
          >
            Tracked with Hydra
          </span>
        </div>
      </div>
    );
  }
);
