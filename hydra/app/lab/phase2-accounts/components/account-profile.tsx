"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RiUser3Line,
  RiDropLine,
  RiFireLine,
  RiCalendarCheckLine,
  RiLogoutBoxRLine,
  RiCloudLine,
  RiPencilLine,
  RiShieldCheckLine,
} from "@remixicon/react";

export type AccountProfileProps = {
  name: string;
  email: string;
  avatarUrl?: string;
  dailyGoal: number;
  totalEntries: number;
  streak: number;
  memberSince: string;
  onEditProfile: () => void;
  onSignOut: () => void;
};

export function AccountProfile({
  name,
  email,
  avatarUrl,
  dailyGoal,
  totalEntries,
  streak,
  memberSince,
  onEditProfile,
  onSignOut,
}: AccountProfileProps) {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      {/* Header with avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="size-16 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
              <RiUser3Line className="size-7 text-primary" />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
            <RiShieldCheckLine className="size-3 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">{name}</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onEditProfile}>
          <RiPencilLine className="size-5" />
        </Button>
      </div>

      {/* Sync status */}
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5">
        <RiCloudLine className="size-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-600">
          Synced across devices
        </span>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          Just now
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 pt-4">
            <RiDropLine className="size-5 text-primary" />
            <p className="text-lg font-bold text-foreground">{totalEntries}</p>
            <p className="text-[10px] text-muted-foreground">Total logs</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 pt-4">
            <RiFireLine className="size-5 text-orange-500" />
            <p className="text-lg font-bold text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Day streak</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-1 pt-4">
            <RiCalendarCheckLine className="size-5 text-emerald-500" />
            <p className="text-lg font-bold text-foreground">
              {dailyGoal >= 1000 ? `${dailyGoal / 1000}L` : `${dailyGoal}ml`}
            </p>
            <p className="text-[10px] text-muted-foreground">Daily goal</p>
          </CardContent>
        </Card>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium text-foreground">{memberSince}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage</span>
            <span className="text-sm font-medium text-foreground">Cloud</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Provider</span>
            <span className="text-sm font-medium text-foreground">Google</span>
          </div>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full gap-2 text-destructive"
        onClick={onSignOut}
      >
        <RiLogoutBoxRLine className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
