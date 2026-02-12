"use client";

import { useEffect, useState } from "react";

export type StoryProgressRingProps = {
  consumed: number;
  goal: number;
};

export function StoryProgressRing({ consumed, goal }: StoryProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / goal, 1);
  const offset = circumference * (1 - animatedProgress);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedProgress(progress), 200);
    return () => clearTimeout(timeout);
  }, [progress]);

  const liters = (consumed / 1000).toFixed(1);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div
        className="absolute"
        style={{
          width: size + 20,
          height: size + 20,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.6 0.15 160 / 0.15) 60%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          style={{ stroke: "oklch(0.25 0.02 260)" }}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ stroke: "oklch(0.72 0.19 160)" }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold"
          style={{ color: "oklch(0.72 0.19 160)" }}
        >
          {liters}L
        </span>
        <span
          className="mt-0.5 text-sm font-medium"
          style={{ color: "oklch(0.72 0.19 160 / 0.7)" }}
        >
          Goal reached!
        </span>
      </div>
    </div>
  );
}
