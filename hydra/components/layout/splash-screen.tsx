"use client";

import { useState, useEffect } from "react";
import { RiDropFill } from "@remixicon/react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2500);
    const hideTimer = setTimeout(() => setVisible(false), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <RiDropFill className="size-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Hydra
        </h1>
        <p className="text-sm text-muted-foreground">Stay hydrated</p>
      </div>
    </div>
  );
}
