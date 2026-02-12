"use client";

import { useRef } from "react";
import { RecapCard } from "./recap-card";
import { ShareButton } from "./share-button";

const MOCK_WEEK = {
  weekLabel: "Feb 3 – Feb 9, 2026",
  dailyTotals: [1800, 2100, 2400, 1600, 2000, 2800, 2200],
  goal: 2000,
  streak: 12,
};

export function WeeklyRecap() {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-6 pb-4">
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Weekly Recap
        </h2>
        <p className="text-sm text-muted-foreground">
          Auto-generated every Sunday
        </p>
      </div>

      {/* Card */}
      <RecapCard ref={cardRef} {...MOCK_WEEK} />

      {/* Share */}
      <div className="w-full max-w-[320px]">
        <ShareButton
          cardRef={cardRef}
          filename="hydra-weekly-recap.png"
          shareText="My weekly hydration recap — tracked with Hydra!"
        />
      </div>

      {/* Info */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-foreground">How it works</p>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
            Generated automatically every Sunday evening
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
            Green bars = days you hit your goal
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
            Share to celebrate consistency, not just single days
          </li>
        </ul>
      </div>
    </div>
  );
}
