"use client";

import {
  RiDropLine,
  RiFireLine,
  RiMedalLine,
  RiTrophyLine,
  RiShieldStarLine,
  RiLockLine,
} from "@remixicon/react";
import { Card, CardContent } from "@/components/ui/card";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  progress?: { current: number; target: number };
  color: string;
  bgColor: string;
  unlockedDate?: string;
};

const BADGES: Badge[] = [
  {
    id: "first-glass",
    name: "First Glass",
    description: "Log your first water entry",
    icon: RiDropLine,
    unlocked: true,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    unlockedDate: "Jan 27",
  },
  {
    id: "7-day-streak",
    name: "7-Day Streak",
    description: "Hit your goal 7 days in a row",
    icon: RiFireLine,
    unlocked: true,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    unlockedDate: "Feb 3",
  },
  {
    id: "30-day-streak",
    name: "30-Day Streak",
    description: "Hit your goal 30 days in a row",
    icon: RiMedalLine,
    unlocked: false,
    progress: { current: 12, target: 30 },
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "100l-club",
    name: "100L Club",
    description: "Log a total of 100 liters",
    icon: RiTrophyLine,
    unlocked: false,
    progress: { current: 45, target: 100 },
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "hydration-hero",
    name: "Hydration Hero",
    description: "Exceed your goal by 50% in a single day",
    icon: RiShieldStarLine,
    unlocked: false,
    progress: { current: 0, target: 1 },
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

export function AchievementBadges() {
  const unlocked = BADGES.filter((b) => b.unlocked);
  const locked = BADGES.filter((b) => !b.unlocked);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Badges</h2>
        <p className="text-sm text-muted-foreground">
          {unlocked.length} of {BADGES.length} unlocked
        </p>
      </div>

      {/* Progress overview */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${(unlocked.length / BADGES.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">
          {Math.round((unlocked.length / BADGES.length) * 100)}%
        </span>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Unlocked
          </p>
          <div className="grid grid-cols-1 gap-3">
            {unlocked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            In progress
          </p>
          <div className="grid grid-cols-1 gap-3">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = badge.icon;
  const progressPct = badge.progress
    ? (badge.progress.current / badge.progress.target) * 100
    : 0;

  return (
    <Card className={badge.unlocked ? "" : "opacity-75"}>
      <CardContent className="flex items-center gap-4">
        <div
          className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl ${
            badge.unlocked ? badge.bgColor : "bg-muted"
          }`}
        >
          <Icon
            className={`size-6 ${
              badge.unlocked ? badge.color : "text-muted-foreground"
            }`}
          />
          {!badge.unlocked && (
            <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-muted-foreground/20">
              <RiLockLine className="size-3 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {badge.name}
            </p>
            {badge.unlockedDate && (
              <span className="text-[10px] text-muted-foreground">
                {badge.unlockedDate}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{badge.description}</p>

          {/* Progress bar for locked badges */}
          {badge.progress && !badge.unlocked && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    badge.bgColor.replace("/10", "")
                  }`}
                  style={{
                    width: `${progressPct}%`,
                    background: `oklch(0.6 0.12 ${
                      badge.color.includes("amber")
                        ? "80"
                        : badge.color.includes("emerald")
                          ? "160"
                          : "300"
                    })`,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {badge.progress.current}/{badge.progress.target}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
