"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiArrowLeftLine, RiMagicLine } from "@remixicon/react";
import Link from "next/link";
import { PermissionPrompt } from "./components/permission-prompt";
import { RemindersHub } from "./components/reminders-hub";
import { ScheduleConfig } from "./components/schedule-config";
import { ActiveReminders } from "./components/active-reminders";

const SCREENS = [
  { id: "permission", label: "Onboarding" },
  { id: "hub", label: "Hub" },
  { id: "schedule", label: "Schedule" },
  { id: "active", label: "Active" },
] as const;

type ScreenId = (typeof SCREENS)[number]["id"];

export default function RemindersUxPage() {
  const [active, setActive] = useState<ScreenId>("permission");

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
            Reminders UX
          </span>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <RiMagicLine className="size-3" />
            Lab
          </Badge>
        </div>
      </div>

      {/* Screen tabs */}
      <div className="flex gap-1 border-b border-border px-3 py-1.5">
        {SCREENS.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setActive(screen.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active === screen.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {screen.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {active === "permission" && <PermissionPrompt />}
        {active === "hub" && <RemindersHub />}
        {active === "schedule" && <ScheduleConfig />}
        {active === "active" && <ActiveReminders />}
      </div>
    </div>
  );
}
