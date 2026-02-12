"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDropLine,
  RiBarChartBoxLine,
  RiTrophyLine,
  RiUser3Line,
} from "@remixicon/react";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: RiDropLine },
  { href: "/history", label: "History", icon: RiBarChartBoxLine },
  { href: "/social", label: "Social", icon: RiTrophyLine },
  { href: "/profile", label: "Profile", icon: RiUser3Line },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on lab routes
  if (pathname.startsWith("/lab")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
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
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
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
