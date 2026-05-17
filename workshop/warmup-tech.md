# Warmup: Tech Context — Hydra

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix primitives, Maia style) |
| Icons | Remix Icon (via remixicon) |
| Font | Outfit (Google Fonts) |
| State | Zustand (client state) + Local Storage (persistence) |
| Database | None for MVP — local-first with localStorage |
| Auth | None for MVP — optional future addition |
| Notifications | Web Push API (notifications permission) |
| Deployment | Vercel |
| Package Manager | pnpm |

## Architecture

### Approach
Local-first, single-page feel. All data lives in the browser via localStorage until the user opts into an account. No backend for MVP — the app is a static deploy with client-side logic only.

### Folder Structure
```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx          # Dashboard (main screen)
│   └── history/
│       └── page.tsx      # History view
├── components/
│   ├── ui/               # Design system primitives
│   ├── log/              # Intake logging components
│   ├── progress/         # Progress ring, goal display
│   ├── streaks/          # Streak counter, calendar
│   └── reminders/        # Reminder settings
├── stores/
│   └── hydration.ts      # Zustand store + localStorage sync
├── lib/
│   ├── constants.ts      # Preset amounts, defaults
│   ├── utils.ts          # Date helpers, calculations
│   └── types.ts          # Shared TypeScript types
└── hooks/
    ├── use-hydration.ts  # Main hydration data hook
    └── use-reminders.ts  # Notification scheduling
```

### Data Model
```typescript
type Intake = {
  id: string           // nanoid
  amount: number       // ml
  timestamp: string    // ISO 8601
}

type DayRecord = {
  date: string         // YYYY-MM-DD
  intakes: Intake[]
  goalMl: number
  totalMl: number
}

type UserSettings = {
  dailyGoalMl: number        // default: 2000
  presets: number[]           // default: [200, 300, 500]
  remindersEnabled: boolean
  reminderIntervalMin: number // default: 60
  reminderStartHour: number   // default: 8
  reminderEndHour: number     // default: 22
}

type HydrationState = {
  today: DayRecord
  history: DayRecord[]       // last 90 days
  settings: UserSettings
  currentStreak: number
  longestStreak: number
}
```

## Patterns & Conventions

### Code Style
- Functional components only, no classes
- Named exports (no default exports except pages)
- Collocate tests next to source files (`component.test.tsx`)
- Props interfaces named `[Component]Props`

### Component Pattern
```typescript
// components/log/quick-log-button.tsx
interface QuickLogButtonProps {
  amountMl: number
  onLog: (amount: number) => void
}

export function QuickLogButton({ amountMl, onLog }: QuickLogButtonProps) {
  // ...
}
```

### State Management
- Zustand store for all hydration state
- `persist` middleware for localStorage sync
- No prop drilling — components consume store directly via hooks
- Optimistic updates (log immediately, persist async)

### UI Framework (shadcn/ui)
- Preset: Maia style with Radix primitives
- Theme: Cyan accent, Gray base color
- Border radius: Large (0.625rem)
- All UI primitives live in `components/ui/` — generated via `npx shadcn@latest add`
- Never modify generated shadcn components directly — extend via wrapper components
- Use shadcn's `cn()` utility for conditional class merging

### Accessibility
- WCAG AA minimum
- All interactive elements keyboard-navigable
- Progress ring uses `role="progressbar"` with `aria-valuenow`
- Color is never the only indicator — always pair with text/icon
- Touch targets minimum 44x44px

### Performance
- No unnecessary re-renders — Zustand selectors for granular subscriptions
- No external API calls in MVP
- Target: Lighthouse Performance > 95
- Bundle size budget: < 100KB gzipped
