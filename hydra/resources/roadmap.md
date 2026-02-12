# Hydra — Product Roadmap

## Vision

Hydra starts as a personal hydration habit builder and evolves into a health-engagement platform connecting users, health professionals, and wellness brands. The moat remains the same at every stage: make the user come back every day, effortlessly.

---

## Personas

### Users

**Ana — The Desk Professional**
32 years old, product designer, 8h+ seated. Knows she doesn't drink enough water, gets headaches by 3pm. Tried tracking apps before, always abandons within a week. Needs frictionless logging and gentle reminders. Values simplicity over features.

**Lucas — The Habit Builder**
28 years old, software engineer, recently started a wellness routine. Tracks sleep and exercise, wants to add hydration. Motivated by streaks and consistency. Wants a clear daily goal and history to spot patterns. Shares progress on social media.

### Professionals

**Camila — The Nutritionist**
35 years old, clinical nutritionist with 200+ active patients. Currently sends hydration recommendations via WhatsApp — no way to track if patients follow through. Wants to publish evidence-based hydration guidelines and see aggregated adherence data. Values credibility and professional tools over consumer features.

**Rafael — The Personal Trainer**
30 years old, personal trainer at a boutique gym. Manages 40 clients and always reminds them to hydrate. Wants to set custom hydration goals for clients based on their activity level and body weight. Needs a simple way to onboard clients and monitor compliance without being intrusive.

### Ads Managers

**Marina — The Brand Manager**
29 years old, marketing manager at a wellness supplements company. Manages digital campaigns across multiple platforms. Interested in Hydra because the audience is health-conscious and engaged daily. Needs a self-serve ads dashboard with targeting by engagement level, clear reporting, and brand-safe placement. Values transparency on ad performance and audience quality over reach volume.

**Thiago — The Agency Media Buyer**
33 years old, works at a digital agency managing campaigns for multiple health and fitness brands. Needs bulk campaign management, A/B testing, and detailed analytics. Wants API access for integration with existing ad platforms. Values efficiency and data granularity.

---

## Roadmap Phases

### Phase 1 — MVP: Build the Habit
**Status:** Prototype complete (`/lab/hydra-mvp`)
**Goal:** Validate the core loop — log water, see progress, come back tomorrow.

| Feature | Description |
|---------|-------------|
| Quick Log | One-tap water intake with presets (200ml, 300ml, 500ml, custom) |
| Daily Goal + Progress Ring | Visual circular progress toward personalized daily target |
| Streaks | Consecutive days counter for positive reinforcement |
| History | Weekly/monthly hydration pattern visualization |
| Manage Logs | Edit and delete past entries |
| Local Persistence | All data in localStorage — no account required |

**Success criteria:** 7-day retention > 40%, median streak > 5 days, log time < 3 seconds.

---

### Phase 2 — Accounts & Cloud Foundation
**Goal:** Unlock cross-device sync and set the foundation for all multi-user features.

| Feature | Description |
|---------|-------------|
| Google Sign-In | OAuth 2.0 login — single tap, no password, no friction |
| Account Profile | Name, avatar, preferences (goal, presets, units) |
| Cloud Sync | Migrate localStorage data to cloud on first login; real-time sync across devices |
| Guest-to-Account Migration | Seamless upgrade path — existing data preserved when user creates account |
| Push Reminders | Configurable notifications (start/end time, interval). Web Push API + service worker |
| Daily Summary Notification | End-of-day summary: "You drank 1.8L today — 90% of your goal" |

**Key decisions:**
- Backend: lightweight API (Next.js API routes or serverless functions)
- Database: Supabase or PlanetScale (leverage Vercel integration)
- Auth: NextAuth.js with Google provider
- Sync strategy: optimistic local-first with background cloud sync

**Success criteria:** 50% of active users create accounts within 14 days, zero data loss on migration.

---

### Phase 3 — Social & Sharing
**Goal:** Turn hydration progress into shareable content that drives organic growth.

| Feature | Description |
|---------|-------------|
| Instagram Story Export | Generate branded story card with daily/weekly stats (progress ring, streak, quote). One-tap share via Web Share API |
| Story Templates | 3-4 visual templates matching Hydra brand — user picks style |
| Weekly Recap Card | Auto-generated summary card every Sunday: weekly total, best day, streak status |
| Achievement Badges | Milestones (7-day streak, 30-day streak, 100L total). Shareable as story cards |
| Share Streak | Quick share of current streak with custom message |

**Organic growth loop:**
User hits milestone → receives shareable card → posts to Instagram → followers discover Hydra → new users.

**Success criteria:** 15% of users share at least one card per month, measurable organic installs from shared content.

---

### Phase 4 — Professional Layer
**Goal:** Enable health professionals to add value to their patients/clients through Hydra.

| Feature | Description |
|---------|-------------|
| Professional Account Type | Separate registration flow with credential verification (CRN, CREF) |
| Professional Profile | Public profile with bio, specialty, credentials, ratings |
| Custom Goal Recommendations | Professionals set personalized hydration goals for connected users (based on weight, activity, climate) |
| Client Connection | Invitation flow — professional sends link, user accepts to share progress data |
| Aggregated Adherence Dashboard | Professional sees anonymized adherence rates across their client base (not individual logs) |
| Published Recommendations | Professionals publish hydration tips and guidelines visible in user's feed |
| Content Cards | Bite-sized educational content: "Why hydration matters after exercise", "Signs of dehydration" |

**Privacy model:**
- Users explicitly opt-in to share with a specific professional
- Professional sees aggregated metrics (adherence rate, avg intake), not individual timestamps
- User can revoke access at any time

**Monetization touchpoint:** Freemium model for professionals — free for up to 10 clients, paid tier for unlimited + analytics.

**Success criteria:** 500 verified professionals in first 6 months, 30% of their connected users show improved adherence.

---

### Phase 5 — Ads Platform
**Goal:** Monetize the engaged, health-conscious audience with non-intrusive, domain-relevant advertising that adds value to the user's hydration journey.

| Feature | Description |
|---------|-------------|
| Today Feed Ads | Native ad card on the Today (home) page — appears below the progress ring, visually consistent with the app. Rotates contextually based on time of day, goal progress, and user engagement level |
| Ad Content Categories | Domain-restricted ad inventory: (1) Medical advice & hydration tips from verified professionals, (2) Bottles & accessories (smart bottles, filters, infusers), (3) Water-based supplements & electrolytes, (4) Discount codes & promotions from wellness brands. Only health/hydration-adjacent categories allowed |
| Ads Manager Portal | Self-serve web portal for advertisers — campaign creation, creative upload, targeting rules, budget, scheduling. Invited by Hydra admin with role-based access |
| Admin Invitation Flow | Hydra admin invites advertisers via email → advertiser creates account → submits brand verification → gets access to campaign builder. Admin controls who can publish |
| Campaign Builder | Step-by-step campaign creation: choose category, upload creative (image + copy), set targeting, define budget, select placements (Today feed, post-goal, history insights, weekly recap sponsor), schedule dates |
| Ad Placements | Multiple native slots: Today feed card (primary), post-goal achievement suggestion, history insights card, weekly recap sponsor badge, share card watermark (optional). Never interrupt the logging flow |
| Audience Targeting | By engagement level (casual, committed, power user), streak length, goal achievement rate, time of day, hydration deficit. No personal data exposed to advertisers |
| Campaign Analytics | Impressions, taps, CTR, engagement time, conversion events. Real-time dashboard per campaign and aggregate |
| Budget & Billing | Daily/total budget caps, CPC/CPM pricing, self-serve billing with invoicing |
| Creative Guidelines | Enforced brand-safe requirements — health/wellness focus only, no misleading health claims, mandatory disclaimer for supplements. Rejected creatives get feedback |
| Ad Review Pipeline | All creatives reviewed before going live (automated content check + manual review for flagged content). Admin has final approve/reject authority |
| A/B Testing | Multi-variant creative testing with automatic winner selection based on CTR and engagement |

**Architecture — Separation of Concerns:**
- **User app** consumes ad placements via a lightweight SDK/API — knows nothing about campaign logic
- **Ads service** manages campaigns, targeting, delivery, billing — fully decoupled from user app
- **Ads manager portal** is a separate frontend consuming the ads service API, accessed by invited advertisers
- **Admin portal** (or section within Hydra's internal tools) manages advertiser invitations, creative approvals, category rules, and platform-wide ad policies
- **Analytics pipeline** processes events asynchronously — no impact on user app performance

**Ad placement principles:**
1. Never interrupt the core loop (logging, viewing progress)
2. Ads appear in contextual moments (after achieving a goal, in weekly insights, in the Today feed below active content)
3. All ads are visually consistent with Hydra's design language — users should feel the ad is a natural part of the experience
4. Users can dismiss any ad. High dismiss rate = ad gets deprioritized
5. Ad content must be relevant to the hydration/wellness domain — no generic display ads

**Advertiser onboarding flow:**
1. Hydra admin invites advertiser (Marina/Thiago personas) via email
2. Advertiser creates account, submits brand profile and category
3. Admin verifies brand is health/wellness-adjacent, approves access
4. Advertiser creates campaigns in self-serve portal
5. Creatives go through review pipeline before going live
6. Advertiser monitors performance in real-time dashboard

**Monetization model:** CPM for awareness, CPC for engagement. Premium tier (ad-free) available for users.

**Success criteria:** 70% of users find ads non-intrusive (survey), ads CTR > 2% (contextual relevance), $X ARPU from ads, 100% of live ads are domain-relevant.

---

### Phase 6 — Platform Maturity
**Goal:** Consolidate Hydra as the hydration engagement platform.

| Feature | Description |
|---------|-------------|
| Premium Tier (Users) | Ad-free experience, advanced insights (hydration vs. activity correlation), priority access to professional recommendations |
| Premium Tier (Professionals) | Unlimited clients, custom branded reports, priority placement in professional directory |
| API & Integrations | Public API for fitness apps (Apple Health, Google Fit, Strava) to read/write hydration data |
| Smart Reminders | ML-based reminder timing — learn when user typically forgets to hydrate and nudge proactively |
| Hydration Insights | Correlate hydration patterns with weather, weekday, activity level. Surface actionable insights |
| Multi-language | Portuguese (BR), English, Spanish — expand market |
| Ads API | Programmatic ads buying for agencies (Thiago persona). Integrate with existing ad platforms |
| Referral Program | User invites friend → both get premium trial. Professional refers colleague → extended trial |

---

## Phasing Strategy

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5 ──→ Phase 6
 MVP        Accounts     Social     Pros         Ads         Platform
 (done)     Foundation   Growth     Layer        Revenue     Maturity
            ─────────────────────────────────────────────────────────→
            User value builds first          Revenue layers on top
```

**Principle:** Each phase must deliver standalone value. No phase exists solely to enable a future one.

**Revenue timeline:**
- Phases 1-3: Free — focus on user acquisition and retention
- Phase 4: First revenue via professional subscriptions (B2B SaaS)
- Phase 5: Ads revenue (B2B marketplace)
- Phase 6: Premium user subscriptions + API licensing + ads scale

---

## Technical Evolution by Phase

| Phase | Backend | Database | Auth | New Infrastructure |
|-------|---------|----------|------|--------------------|
| 1 | None | localStorage | None | — |
| 2 | Next.js API routes | Supabase/PlanetScale | NextAuth + Google | Vercel serverless |
| 3 | Same | Same + media storage (S3/Cloudflare R2) | Same | Image generation service |
| 4 | Microservice: professional-api | Same + row-level security | Role-based (user/professional) | Verification pipeline |
| 5 | Microservice: ads-service | Ads database (separate) | Role-based (+ ads_manager) | Analytics pipeline, billing |
| 6 | API gateway | Same + read replicas | OAuth for third-party apps | ML pipeline, CDN expansion |

---

## Open Questions

- **Phase 2:** Supabase vs PlanetScale — evaluate based on real-time sync requirements and pricing at scale
- **Phase 3:** Web Share API coverage — fallback for browsers that don't support it (download image + manual share)
- **Phase 4:** Professional credential verification — manual review vs. integration with CRN/CREF databases
- **Phase 5:** Ads minimum viable audience — what DAU threshold makes the ads platform viable for advertisers?
- **Phase 5:** Ad category curation — should Hydra curate initial advertiser partners manually (marketplace quality) or open self-serve from day one?
- **Phase 5:** Today feed ad frequency — how often should the ad card rotate? Once per session? Once per hour? Based on log frequency?
- **Phase 5:** Admin tooling — build custom admin or extend the existing Ads Manager Portal with admin-level permissions?
- **Phase 6:** Apple Health / Google Fit integration — requires native app or PWA with Health Connect API
