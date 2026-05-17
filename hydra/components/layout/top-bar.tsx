"use client";

import { usePathname } from "next/navigation";
import { RiDropFill } from "@remixicon/react";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/lab")) return null;

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/60 px-4 py-2.5 backdrop-blur-xl saturate-150">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <RiDropFill className="size-5 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Hydra
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}
