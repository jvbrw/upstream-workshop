# Warmup: Project Context — Hydra

## Product

| Field | Value |
|-------|-------|
| Name | Hydra |
| Type | Mobile-first web application |
| Stage | Greenfield — MVP |
| Domain | Health & Wellness / Habit Formation |

## Vision

Make daily hydration the easiest healthy habit to build and sustain. Hydra exists to turn a one-time intention ("I should drink more water") into an automatic routine — and keep it going.

## Moat

Hydration as a routine. We don't compete on features, gamification, or ecosystem integrations. We compete on the ability to make people come back every day, effortlessly.

## Personas

### Ana — The Desk Worker
- 32, product designer, works 8h+ at a desk
- Knows she doesn't drink enough water, gets headaches by 3pm
- Has tried tracking apps before, always abandons within a week
- Needs: zero-friction logging, gentle nudges, visible progress without guilt

### Lucas — The Habit Builder
- 28, software engineer, recently started a wellness routine
- Tracking sleep, exercise, and wants to add hydration
- Motivated by streaks and consistency, not by points or rewards
- Needs: daily goal, streak visibility, simple history to see patterns

## Core Features (MVP)

1. **Quick Log** — Tap to log intake (presets: 200ml, 300ml, 500ml, custom)
2. **Daily Goal** — Personalized target (default 2L, adjustable)
3. **Progress Ring** — Visual daily progress toward goal
4. **Streaks** — Consecutive days hitting the goal
5. **History** — Weekly/monthly hydration patterns
6. **Reminders** — Optional notifications at configurable intervals

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to log | < 3 seconds |
| Daily goal completion | 60% of active users hit goal 4x/week |
| 7-day retention | > 40% |
| Streak median | > 5 days for retained users |

## Constraints

- Mobile-first responsive web (no native app)
- No account required for basic use (local storage first)
- Optional sign-up for sync and history persistence
- Lightweight — instant feel, no loading states
- WCAG AA accessible

## Out of Scope (MVP)

- Wearable / health platform integrations
- Social features (sharing, leaderboards)
- Other beverages or nutrient tracking
- Premium / monetization features

## Glossary

| Term | Definition |
|------|-----------|
| Intake | A single logged water consumption event |
| Daily Goal | The target volume (ml) a user aims to drink per day |
| Streak | Consecutive calendar days where the user met their daily goal |
| Progress Ring | Circular visual indicator showing % of daily goal completed |
| Reminder | A scheduled notification prompting the user to drink water |
