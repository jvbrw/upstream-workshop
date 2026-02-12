"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiMagicLine,
} from "@remixicon/react";
import Link from "next/link";
import { SignInPrompt } from "./components/sign-in-prompt";
import { MigrationPrompt } from "./components/migration-prompt";
import { AccountProfile } from "./components/account-profile";
import { RemindersConfig } from "./components/reminders-config";

const SCREENS = [
  { id: "sign-in", label: "Sign In" },
  { id: "migration", label: "Migration" },
  { id: "profile", label: "Profile" },
  { id: "reminders", label: "Reminders" },
] as const;

type Screen = (typeof SCREENS)[number]["id"];

export default function Phase2AccountsPage() {
  const [screen, setScreen] = useState<Screen>("sign-in");
  const currentIdx = SCREENS.findIndex((s) => s.id === screen);

  function goNext() {
    if (currentIdx < SCREENS.length - 1) {
      setScreen(SCREENS[currentIdx + 1].id);
    }
  }

  function goPrev() {
    if (currentIdx > 0) {
      setScreen(SCREENS[currentIdx - 1].id);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Link href="/lab">
            <Button variant="ghost" size="icon-sm">
              <RiArrowLeftLine className="size-4" />
            </Button>
          </Link>
          <span className="text-sm font-medium text-foreground">
            Phase 2 — Accounts
          </span>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <RiMagicLine className="size-3" />
            Lab
          </Badge>
        </div>
      </div>

      {/* Screen selector */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-1.5">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScreen(s.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              s.id === screen
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {screen === "sign-in" && (
          <SignInPrompt
            hasLocalData={true}
            onSignIn={goNext}
            onSkip={() => setScreen("reminders")}
          />
        )}
        {screen === "migration" && (
          <MigrationPrompt
            localEntries={87}
            localDays={14}
            localStreak={9}
            onMigrate={goNext}
            onStartFresh={goNext}
          />
        )}
        {screen === "profile" && (
          <AccountProfile
            name="Ana Costa"
            email="ana.costa@gmail.com"
            dailyGoal={2000}
            totalEntries={87}
            streak={9}
            memberSince="Feb 2026"
            onEditProfile={() => {}}
            onSignOut={() => setScreen("sign-in")}
          />
        )}
        {screen === "reminders" && <RemindersConfig />}
      </div>

      {/* Bottom navigation between screens */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="gap-1"
        >
          <RiArrowLeftLine className="size-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          {currentIdx + 1} / {SCREENS.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={goNext}
          disabled={currentIdx === SCREENS.length - 1}
          className="gap-1"
        >
          Next
          <RiArrowRightLine className="size-4" />
        </Button>
      </div>
    </div>
  );
}
