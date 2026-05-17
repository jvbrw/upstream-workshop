"use client";

import { useEffect, useState } from "react";
import { useHydrationStore } from "@/hooks/use-hydration-store";

export function StoreNotifications() {
  const dataWasReset = useHydrationStore((s) => s._dataWasReset);
  const clearResetFlag = useHydrationStore((s) => s._clearResetFlag);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (dataWasReset) {
      setVisible(true);
      clearResetFlag();
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [dataWasReset, clearResetFlag]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground shadow-lg">
      Your data was reset due to a problem. Sorry for the inconvenience.
    </div>
  );
}
