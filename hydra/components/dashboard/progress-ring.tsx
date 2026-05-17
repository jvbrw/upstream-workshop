"use client";

export type ProgressRingProps = {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({
  current,
  goal,
  size = 200,
  strokeWidth = 14,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const offset = circumference * (1 - progress);
  const isComplete = current >= goal;

  return (
    <div
      className="relative flex items-center justify-center"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-label={`Hydration progress: ${current >= 1000 ? `${Math.round(current / 100) / 10}L` : `${current}ml`} of ${goal >= 1000 ? `${goal / 1000}L` : `${goal}ml`}${isComplete ? " — Goal reached" : ""}`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`motion-safe:transition-all motion-safe:duration-700 ease-out ${
            isComplete ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
          }`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <>
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((current / 1000) * 10) / 10}L
            </span>
            <span className="mt-0.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Goal reached!
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-foreground">
              {current >= 1000
                ? `${Math.round(current / 100) / 10}L`
                : `${current}ml`}
            </span>
            <span className="mt-0.5 text-sm text-muted-foreground">
              of {goal >= 1000 ? `${goal / 1000}L` : `${goal}ml`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
