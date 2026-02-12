"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiArrowLeftLine,
  RiMagicLine,
  RiPaletteLine,
} from "@remixicon/react";
import Link from "next/link";
import { StoryCard } from "./components/story-card";
import { ShareActions } from "./components/share-actions";

const MOCK_SCENARIOS = [
  { consumed: 2100, goal: 2000, streak: 12, label: "Typical win" },
  { consumed: 2500, goal: 2000, streak: 30, label: "Power user" },
  { consumed: 3000, goal: 2500, streak: 7, label: "First week" },
  { consumed: 2000, goal: 2000, streak: 1, label: "Day one" },
] as const;

export default function StoryExportPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scenario, setScenario] = useState(0);

  const { consumed, goal, streak } = MOCK_SCENARIOS[scenario];

  return (
    <div className="flex min-h-dvh flex-col items-center bg-muted/30">
      {/* Top bar */}
      <div className="flex w-full max-w-md items-center gap-3 px-4 py-4">
        <Link href="/lab">
          <Button variant="ghost" size="icon" className="shrink-0">
            <RiArrowLeftLine className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Story Export</h1>
          <p className="text-xs text-muted-foreground">
            Share your daily achievement
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <RiMagicLine className="size-3" />
          Lab
        </Badge>
      </div>

      {/* Card preview */}
      <div className="flex flex-col items-center gap-6 px-4 py-6">
        <StoryCard
          ref={cardRef}
          consumed={consumed}
          goal={goal}
          streak={streak}
          date={new Date()}
        />

        {/* Share actions */}
        <ShareActions cardRef={cardRef} />

        {/* Scenario switcher */}
        <div className="flex w-[360px] flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RiPaletteLine className="size-4" />
            <span className="font-medium">Try different scenarios</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_SCENARIOS.map((s, i) => (
              <Button
                key={i}
                variant={i === scenario ? "default" : "outline"}
                size="sm"
                className="justify-start gap-2 text-xs"
                onClick={() => setScenario(i)}
              >
                <span className="font-semibold">
                  {(s.consumed / 1000).toFixed(1)}L
                </span>
                <span className="text-muted-foreground">
                  {s.label}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
