"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RiShareLine, RiCloseLine } from "@remixicon/react";
import Link from "next/link";

export type GoalCelebrationProps = {
  consumed: number;
  goal: number;
  streak: number;
  onDismiss: () => void;
};

export function GoalCelebration({
  consumed,
  goal,
  streak,
  onDismiss,
}: GoalCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const liters = (consumed / 1000).toFixed(1);
  const goalLiters = (goal / 1000).toFixed(1);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 motion-safe:transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onDismiss}
      role="dialog"
      aria-label="Goal reached celebration"
    >
      <div
        className={`relative mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-card p-8 shadow-2xl transition-transform duration-500 motion-safe:transition-transform ${
          visible ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3"
          onClick={onDismiss}
          aria-label="Dismiss celebration"
        >
          <RiCloseLine className="size-5" />
        </Button>

        {/* Confetti dots */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="absolute size-2 rounded-full motion-safe:animate-bounce"
              style={{
                background: [
                  "oklch(0.72 0.19 160)",
                  "oklch(0.80 0.13 212)",
                  "oklch(0.75 0.15 55)",
                  "oklch(0.70 0.20 320)",
                ][i % 4],
                left: `${10 + (i * 7.5)}%`,
                top: `${8 + ((i * 13) % 30)}%`,
                animationDelay: `${i * 120}ms`,
                animationDuration: `${1200 + (i * 100)}ms`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Trophy / celebration icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
          <span className="text-3xl" role="img" aria-hidden="true">
            🎉
          </span>
        </div>

        {/* Message */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Goal reached!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You drank {liters}L of your {goalLiters}L goal
            {streak > 1 && ` — ${streak} day streak!`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2">
          <Link href="/lab/story-export" className="w-full">
            <Button className="w-full gap-2" size="lg">
              <RiShareLine className="size-5" />
              Share your win
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
