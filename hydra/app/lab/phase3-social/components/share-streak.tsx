"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StreakCard } from "./streak-card";
import { ShareButton } from "./share-button";

const MOCK_STREAKS = [
  { streak: 1, consumed: 2000, goal: 2000, label: "Day one" },
  { streak: 7, consumed: 2100, goal: 2000, label: "One week" },
  { streak: 14, consumed: 1800, goal: 2000, label: "Two weeks" },
  { streak: 30, consumed: 2500, goal: 2000, label: "One month" },
] as const;

export function ShareStreak() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mockIdx, setMockIdx] = useState(1);

  const { streak, consumed, goal } = MOCK_STREAKS[mockIdx];

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-6 pb-4">
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Share Streak
        </h2>
        <p className="text-sm text-muted-foreground">
          Show the world your consistency
        </p>
      </div>

      {/* Card */}
      <StreakCard
        ref={cardRef}
        streak={streak}
        todayConsumed={consumed}
        todayGoal={goal}
      />

      {/* Share */}
      <div className="w-full max-w-[320px]">
        <ShareButton
          cardRef={cardRef}
          filename="hydra-streak.png"
          shareText={`I'm on a ${streak}-day hydration streak with Hydra!`}
        />
      </div>

      {/* Streak scenarios */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Preview milestones
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_STREAKS.map((s, i) => (
            <Button
              key={s.streak}
              variant={i === mockIdx ? "default" : "outline"}
              size="sm"
              className="justify-start gap-2 text-xs"
              onClick={() => setMockIdx(i)}
            >
              <span className="font-semibold">{s.streak}d</span>
              <span className={i === mockIdx ? "text-primary-foreground/70" : "text-muted-foreground"}>
                {s.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
