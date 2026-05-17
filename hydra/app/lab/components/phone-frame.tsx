"use client";

import Link from "next/link";
import { RiExternalLinkLine } from "@remixicon/react";

type PhoneFrameProps = {
  label: string;
  screen: string;
  href: string;
  children: React.ReactNode;
};

export function PhoneFrame({ label, screen, href, children }: PhoneFrameProps) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-2">
      {/* Label bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{screen}</span>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Open
          <RiExternalLinkLine className="size-3" />
        </Link>
      </div>

      {/* Phone device */}
      <div className="overflow-hidden rounded-[2rem] border-2 border-border bg-background shadow-lg">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-background px-6 py-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">
            9:41
          </span>
          <div className="flex items-center gap-1">
            <div className="flex items-end gap-[2px]">
              {[6, 8, 10, 12].map((h) => (
                <div
                  key={h}
                  className="w-[3px] rounded-sm bg-muted-foreground"
                  style={{ height: h }}
                />
              ))}
            </div>
            <svg
              className="ml-1 size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="1" y="6" width="20" height="12" rx="2" />
              <rect x="22" y="9" width="1.5" height="6" rx="0.5" />
            </svg>
          </div>
        </div>

        {/* Content area */}
        <div className="h-[540px] overflow-y-auto bg-background">{children}</div>

        {/* Home indicator */}
        <div className="flex justify-center bg-background pb-2 pt-1">
          <div className="h-1 w-28 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}
