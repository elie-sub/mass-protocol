# ELIE // MASS PROTOCOL — handoff

Personal 12-month muscle-gain operating system for Elie (26, 190 cm, ~76 kg, lots of padel).
`mass-protocol.jsx` is the original V1 (single-file React). It stays in the repo as the reference for design,
copy and logic, but is not part of the build (ignored by ESLint, tsconfig and `.vercelignore`).

## Stack (migrated)
- Next.js 16 (App Router) + TypeScript + Tailwind v4, deployed on Vercel: project `adbase/mass-protocol`,
  production https://mass-protocol-one.vercel.app
- Supabase via the Vercel Marketplace (resource `mass-protocol`, free plan, Paris). Env vars are injected by the
  integration; `ALLOWED_EMAIL` is set on all environments. `vercel env pull` refreshes `.env.local`.
  Without `NEXT_PUBLIC_SUPABASE_*` the app falls back to device storage only (localStorage + IndexedDB).
- Login: magic link only (Supabase no longer allows editing email templates without custom SMTP, so no 6-digit code).
  The installed iPhone app doesn't share storage with Safari, so it sends a one-time nonce with the request and polls
  `/api/auth/handoff`; Safari, on opening the link, parks the session there and steps aside (`components/shell/ClientApp.tsx`).
  Never call `signOut()` in that relay path: it revokes the session server-side.
  No-email alternative: the login screen shows an 8-char pairing code; a signed-in device enters it in
  Profile → "Connecter un appareil" and `/api/auth/pair` mints a fresh, independent session for the new device.
- Supabase Auth: Site URL = production URL; redirect allow list = `https://mass-protocol-one.vercel.app/**`, `http://localhost:3000/**`.
  Built-in email sender is rate-limited to a few emails per hour.
- PWA: `app/manifest.ts`, icons in `public/icons`, offline shell in `public/sw.js`, safe-area insets.
- UI in French by default, English available (Profile → Langue). All copy lives in `lib/i18n/{en,fr}.ts`;
  `en.ts` defines the dictionary shape, `fr.ts` must match it. Engines never contain display text.

## Layout
- `app/globals.css` — the V1 design system ported 1:1 (tokens on `:root`, exposed to Tailwind via `@theme`).
  Fonts via `next/font`: Archivo + Big Shoulders at opsz 72 (= the V1 "Big Shoulders Display").
- `lib/utils/date.ts` — date keys `YYYY-MM-DD`, ISO weeks starting Monday.
- `lib/program` — phases, exercise library, templates, schedules, `dayInfo`, `buildWorkout`, `targetFor`.
- `lib/nutrition` — foods, meals, `dayNutrition`, `baseTargets`, `scaleMeal`, `swapOptions`, activity bonus.
- `lib/nutrition/shopping.ts` — shopping trips (`profile.shopDays`, default Mon + Thu: each shop day covers until the next), list per trip grouped by aisle; checked items live in `days[tripStart].shopping`. Page: `/groceries`.
- `lib/metrics` — `defaultState`, `migrate`, `dayTasks`, `scoreOf`, `computeMetrics`, `ACH`, `weekStats`, `weeklySuggestion`.
- `lib/data` — the persistence boundary: `Repo` interface, `localRepo`, `supabaseRepo`, `diffState` (row-level diff),
  `Sync` (offline-first: state mirrored to localStorage, pending edits pushed when back online).
- `components/` — `ui/`, one folder per page, `sheets/`, `workout/`, `shell/` (provider, actions, nav, login).
- `app/(app)/*` — one route per tab. `app/api/auth/otp` sends the magic link (enforces `ALLOWED_EMAIL`), `app/api/auth/handoff` relays it to the installed app.
- `supabase/migrations/` — schema + RLS (owner = auth.uid() on every table) + storage policies.
- `tests/` — Vitest: portion scaling, targets, `targetFor`, streak, weekly suggestion, diff, V1 migration. `npm test`.

## Database changes
Add a new file in `supabase/migrations/` and apply it with `POSTGRES_URL_NON_POOLING` from `.env.local`
(all migrations in the folder are applied). Keep RLS on every table, owner = auth.uid().

## Rules
- Zero decision fatigue: Today is the execution screen. Don't add clicks.
- Calorie targets stay configurable; suggestions never auto-apply.
- No supplements beyond creatine, no PED content. Targets are tracking estimates, not medical advice.
- Keep components under ~300 lines. New copy goes in both `en.ts` and `fr.ts`.
