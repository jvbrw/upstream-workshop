"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDropLine,
  RiBarChartBoxLine,
  RiFileList3Line,
  RiSettings3Line,
} from "@remixicon/react";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: RiDropLine },
  { href: "/history", label: "History", icon: RiBarChartBoxLine },
  { href: "/manage", label: "Manage", icon: RiFileList3Line },
  { href: "/settings", label: "Settings", icon: RiSettings3Line },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on lab routes
  if (pathname.startsWith("/lab")) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border/50 bg-background/60 backdrop-blur-xl saturate-150"
    >
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
