"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiArrowLeftLine, RiMagicLine } from "@remixicon/react";
import Link from "next/link";
import { RemindersConfig } from "./components/reminders-config";

export default function RemindersPage() {
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
            Reminders
          </span>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <RiMagicLine className="size-3" />
            Lab
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <RemindersConfig />
      </div>
    </div>
  );
}
