# Case Proposal: Reminders (US-009)

## Why This Feature

Reminders has zero implementation — clean slate for the demo. It's visual enough for prototyping, technically interesting for scope planning (Web Push API, service workers, permissions), and scoped enough to implement a piece live.

## Thread Across Cases

| Case | What to show |
|---|---|
| **Case 1 (Design Experiment)** | Prototype the reminders UX — configuration screen, enable/schedule interaction, time pickers, toggles. Quick visual exploration with guardrails |
| **Case 2 (Scope Planning)** | Run `/initiative-start` for reminders → classify, generate user stories, break into tasks with DoR |
| **Case 3 (Bonus: Implementation)** | Pick one task from generated DoR (e.g., reminder settings component) and implement in Hydra codebase live |

## Current State

- Defined in warmup-project.md as MVP feature
- Data model exists in warmup-tech.md (UserSettings has reminderEnabled, reminderIntervalMin, reminderStartHour, reminderEndHour)
- No prototype, no implementation, no lab experiment
- Web Push API referenced in tech stack

## Why Over Alternatives

- History tab already prototyped in lab — weakens "from scratch" narrative
- Settings page too generic — less visually compelling
- Social/sharing is Phase 3 — too far from MVP story
- Reminders is relatable, visual, and technically layered
