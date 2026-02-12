"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiRefreshLine,
} from "@remixicon/react";
import Link from "next/link";

const DEVICES = [
  { id: "iphone-se", label: "SE", width: 375, height: 667, radius: 40 },
  { id: "iphone-15", label: "15", width: 393, height: 852, radius: 50 },
  { id: "iphone-pro-max", label: "Pro Max", width: 430, height: 932, radius: 55 },
] as const;

const ROUTES = [
  { path: "/", label: "Today" },
  { path: "/history", label: "History" },
  { path: "/social", label: "Social" },
  { path: "/profile", label: "Profile" },
  { path: "/manage", label: "Manage" },
  { path: "/lab/hydra-mvp", label: "MVP Proto" },
  { path: "/lab/story-export", label: "Story Export" },
  { path: "/lab/phase2-accounts", label: "Phase 2" },
  { path: "/lab/phase3-social", label: "Phase 3" },
] as const;

const BEZEL = 14;
const NOTCH_H = 48;

export default function ViewfinderPage() {
  const [deviceIdx, setDeviceIdx] = useState(1);
  const [routeIdx, setRouteIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const device = DEVICES[deviceIdx];
  const route = ROUTES[routeIdx];

  const frameW = device.width + BEZEL * 2;
  const frameH = device.height + BEZEL * 2 + NOTCH_H;

  useEffect(() => {
    function calcScale() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const padX = 40;
      const padY = 24;
      const scaleX = (rect.width - padX) / frameW;
      const scaleY = (rect.height - padY) / frameH;
      setScale(Math.min(scaleX, scaleY, 1));
    }

    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [frameW, frameH]);

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 font-sans">
      {/* Top toolbar */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Link href="/lab">
            <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-zinc-100">
              <RiArrowLeftLine className="size-4" />
            </Button>
          </Link>
          <span className="text-sm font-medium text-zinc-400">Viewfinder</span>
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">{device.label} {device.width}×{device.height}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-100"
            onClick={() => setIframeKey((k) => k + 1)}
            aria-label="Refresh preview"
          >
            <RiRefreshLine className="size-4" />
          </Button>
          <a href={route.path} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-zinc-100">
              <RiExternalLinkLine className="size-4" />
            </Button>
          </a>
        </div>
      </header>

      {/* Route tabs */}
      <nav className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-zinc-800/60 px-3 py-1.5">
        {ROUTES.map((r, i) => (
          <button
            key={r.path}
            onClick={() => { setRouteIdx(i); setIframeKey((k) => k + 1); }}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              i === routeIdx
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {r.label}
          </button>
        ))}
      </nav>

      {/* Phone frame */}
      <div ref={containerRef} className="flex flex-1 items-center justify-center overflow-hidden">
        <div
          style={{
            width: frameW,
            height: frameH,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Device shell */}
          <div
            className="relative h-full w-full border-[3px] border-zinc-700 bg-zinc-900"
            style={{ borderRadius: device.radius + BEZEL }}
          >
            {/* Side button */}
            <div className="absolute -right-[5px] top-[25%] h-[50px] w-[3px] rounded-r-sm bg-zinc-700" />
            {/* Volume buttons */}
            <div className="absolute -left-[5px] top-[18%] h-[28px] w-[3px] rounded-l-sm bg-zinc-700" />
            <div className="absolute -left-[5px] top-[26%] h-[28px] w-[3px] rounded-l-sm bg-zinc-700" />

            {/* Screen */}
            <div
              className="absolute overflow-hidden bg-black"
              style={{
                top: BEZEL,
                left: BEZEL,
                width: device.width,
                height: device.height + NOTCH_H,
                borderRadius: device.radius,
              }}
            >
              {/* Status bar + Dynamic Island */}
              <div className="relative z-10 flex h-[48px] items-start justify-center bg-black pt-[10px]">
                <div className="h-[26px] w-[115px] rounded-full bg-black ring-1 ring-zinc-800" />
                <span className="absolute left-5 top-[13px] text-[11px] font-semibold text-white/90">
                  {time}
                </span>
                <div className="absolute right-5 top-[13px] flex items-center gap-[3px]">
                  {/* Signal */}
                  <svg className="size-[13px] text-white/90" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="1" y="16" width="3" height="6" rx="0.5" />
                    <rect x="6" y="12" width="3" height="10" rx="0.5" />
                    <rect x="11" y="8" width="3" height="14" rx="0.5" />
                    <rect x="16" y="4" width="3" height="18" rx="0.5" />
                    <rect x="21" y="1" width="3" height="21" rx="0.5" opacity="0.3" />
                  </svg>
                  {/* WiFi */}
                  <svg className="size-[13px] text-white/90" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                  </svg>
                  {/* Battery */}
                  <div className="ml-[2px] flex items-center gap-[2px]">
                    <div className="h-[10px] w-[20px] rounded-[2px] border border-white/50 p-[1px]">
                      <div className="h-full w-[75%] rounded-[1px] bg-white/90" />
                    </div>
                    <div className="h-[4px] w-[1.5px] rounded-r-sm bg-white/50" />
                  </div>
                </div>
              </div>

              {/* App content via iframe */}
              <iframe
                key={`${iframeKey}-${route.path}`}
                src={route.path}
                className="border-0 bg-white dark:bg-black"
                style={{
                  width: device.width,
                  height: device.height + NOTCH_H - 48,
                }}
                title={`${route.label} — ${device.label}`}
              />
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[6px] left-1/2 h-[4px] w-[120px] -translate-x-1/2 rounded-full bg-zinc-600" />
          </div>
        </div>
      </div>

      {/* Device selector */}
      <footer className="flex shrink-0 items-center justify-center gap-1.5 border-t border-zinc-800/60 px-3 py-2">
        {DEVICES.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setDeviceIdx(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              i === deviceIdx
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            iPhone {d.label}
          </button>
        ))}
      </footer>
    </div>
  );
}
