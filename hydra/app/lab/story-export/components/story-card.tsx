"use client";

import { forwardRef } from "react";
import { RiFireLine, RiDropLine } from "@remixicon/react";
import { StoryProgressRing } from "./story-progress-ring";

export type StoryCardProps = {
  consumed: number;
  goal: number;
  streak: number;
  date: Date;
};

export const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(
  function StoryCard({ consumed, goal, streak, date }, ref) {
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const liters = (consumed / 1000).toFixed(1);
    const goalLiters = (goal / 1000).toFixed(1);

    const messages = [
      "Hydration goal crushed!",
      "Another day, another goal!",
      "Consistency is the real flex.",
      "Your body thanks you.",
    ];
    const message = messages[streak % messages.length];

    return (
      <div
        ref={ref}
        className="relative flex aspect-[9/16] w-[360px] flex-col items-center justify-between overflow-hidden rounded-3xl px-8 py-10"
        style={{
          background:
            "linear-gradient(165deg, oklch(0.18 0.04 230) 0%, oklch(0.12 0.03 260) 40%, oklch(0.08 0.02 270) 100%)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.55 0.14 210 / 0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Top: Logo + date */}
        <div className="z-10 flex w-full flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <RiDropLine className="size-6 text-cyan-400" />
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ color: "oklch(0.9 0.06 210)" }}
            >
              hydra
            </span>
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: "oklch(0.65 0.03 260)" }}
          >
            {formattedDate}
          </span>
        </div>

        {/* Center: Ring + Stats */}
        <div className="z-10 flex flex-col items-center gap-5">
          <StoryProgressRing consumed={consumed} goal={goal} />

          <div className="flex flex-col items-center gap-1">
            <span
              className="text-lg font-medium"
              style={{ color: "oklch(0.75 0.03 260)" }}
            >
              {liters}L of {goalLiters}L
            </span>
          </div>

          {/* Streak */}
          <div
            className="flex items-center gap-2 rounded-full px-5 py-2"
            style={{ background: "oklch(0.25 0.04 40 / 0.5)" }}
          >
            <RiFireLine className="size-5 text-orange-400" />
            <span className="text-base font-semibold text-orange-300">
              {streak} day streak
            </span>
          </div>
        </div>

        {/* Bottom: Message + watermark */}
        <div className="z-10 flex flex-col items-center gap-4">
          <p
            className="text-center text-lg font-medium italic"
            style={{ color: "oklch(0.78 0.05 210)" }}
          >
            &ldquo;{message}&rdquo;
          </p>
          <span
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "oklch(0.4 0.02 260)" }}
          >
            Tracked with Hydra
          </span>
        </div>
      </div>
    );
  }
);
