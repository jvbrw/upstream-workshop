"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RiCloudLine,
  RiSmartphoneLine,
  RiArrowRightLine,
  RiDeleteBinLine,
} from "@remixicon/react";

export type MigrationPromptProps = {
  localEntries: number;
  localDays: number;
  localStreak: number;
  onMigrate: () => void;
  onStartFresh: () => void;
};

export function MigrationPrompt({
  localEntries,
  localDays,
  localStreak,
  onMigrate,
  onStartFresh,
}: MigrationPromptProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">
          We found your data
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ve been tracking as a guest. Want to keep it?
        </p>
      </div>

      {/* Data summary card */}
      <Card className="mb-6 w-full max-w-sm">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <RiSmartphoneLine className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Local data</p>
              <p className="text-xs text-muted-foreground">
                Stored on this device
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/50 p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{localEntries}</p>
              <p className="text-[10px] text-muted-foreground">entries</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{localDays}</p>
              <p className="text-[10px] text-muted-foreground">days</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{localStreak}</p>
              <p className="text-[10px] text-muted-foreground">best streak</p>
            </div>
          </div>

          {/* Migration visual */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <RiSmartphoneLine className="size-5 text-muted-foreground" />
            </div>
            <RiArrowRightLine className="size-4 text-primary" />
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <RiCloudLine className="size-5 text-primary" />
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            All your entries will be synced to the cloud. Your streak stays intact.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-2">
        <Button className="w-full gap-2" size="lg" onClick={onMigrate}>
          <RiCloudLine className="size-5" />
          Keep my data
        </Button>
        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          size="sm"
          onClick={onStartFresh}
        >
          <RiDeleteBinLine className="size-4" />
          Start fresh
        </Button>
      </div>
    </div>
  );
}
