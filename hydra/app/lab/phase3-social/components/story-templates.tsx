"use client";

import { useRef, useState } from "react";
import { RiCheckLine } from "@remixicon/react";
import {
  ThemedStoryCard,
  type Theme,
} from "./themed-story-card";
import { ShareButton } from "./share-button";

const THEMES: { id: Theme; label: string; preview: string }[] = [
  {
    id: "dark",
    label: "Dark Gradient",
    preview:
      "linear-gradient(135deg, oklch(0.18 0.04 230), oklch(0.08 0.02 270))",
  },
  {
    id: "light",
    label: "Light Minimal",
    preview:
      "linear-gradient(135deg, oklch(0.98 0.005 260), oklch(0.96 0.01 210))",
  },
  {
    id: "neon",
    label: "Neon Glow",
    preview:
      "linear-gradient(135deg, oklch(0.10 0.02 300), oklch(0.08 0.02 280))",
  },
  {
    id: "ocean",
    label: "Ocean Wave",
    preview:
      "linear-gradient(135deg, oklch(0.25 0.08 210), oklch(0.12 0.04 230))",
  },
];

const MOCK = { consumed: 2100, goal: 2000, streak: 12 };

export function StoryTemplates() {
  const [theme, setTheme] = useState<Theme>("dark");
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-6 pb-4">
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Story Templates
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick a style for your achievement card
        </p>
      </div>

      {/* Card preview */}
      <ThemedStoryCard
        ref={cardRef}
        consumed={MOCK.consumed}
        goal={MOCK.goal}
        streak={MOCK.streak}
        date={new Date()}
        theme={theme}
      />

      {/* Share */}
      <div className="w-full max-w-[320px]">
        <ShareButton
          cardRef={cardRef}
          filename={`hydra-story-${theme}.png`}
          shareText="I hit my daily hydration goal with Hydra!"
        />
      </div>

      {/* Template picker */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Choose template
        </p>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all ${
                theme === t.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div
                className="mb-2 h-16 w-full rounded-lg"
                style={{ background: t.preview }}
              />
              <span
                className={`text-xs font-medium ${
                  theme === t.id
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {t.label}
              </span>
              {theme === t.id && (
                <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary">
                  <RiCheckLine className="size-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
