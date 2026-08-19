# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Landing page / marketing site for Rook System (rooksystem.com.br) — Next.js 14 App Router, TypeScript, Tailwind, pnpm. Everything is written in pt-BR: copy, comments, commit messages, test names. Long "POR QUE ISTO EXISTE" comments explaining decisions are a deliberate repo idiom — keep them, and read them before "fixing" something that looks wrong.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — `prebuild` runs `scripts/sync-billing-catalog.mjs`: fetches the billing catalog from `https://app.rook.com.br/api/billing/catalog`, falls back to the committed snapshot if it's under 7 days old, fails the build otherwise
- `pnpm lint`
- `pnpm test` — all suites (`node --test tests/*.test.mjs`; plain node:test, no framework)
- `node --test tests/<name>.test.mjs` — single suite
- `pnpm test:ci` — the CI gate (`scripts/run-ci-tests.mjs`): **every** `tests/*.test.mjs` runs automatically; exclusions must be declared in `FORA_DO_GATE` with a reason. A new test file enters CI by existing — never maintain a file list.
- `pnpm billing:snapshot` — regenerate `src/data/billing-catalog-v2.snapshot.json` (the `billing-catalog` suite is excluded from CI because this snapshot expires in 7 days; run `pnpm test:billing` manually)

## Delivery flow (enforced by CI)

`work branch → homolog → main`. Open PRs with `--base homolog`. The `guard-main-source.yml` workflow rejects PRs to `main` unless they come from `homolog`, `hotfix/*`, or `revert-*`.

- **Production** = Vercel, auto-publishes `main`.
- **Homolog** = k3s on a VPS, deployed by `deploy-homolog.yml` on push to `homolog`. The homolog image is **not promotable** to production: `NEXT_PUBLIC_*` values are baked into the browser bundle at build time and `NEXT_PUBLIC_ENV=homolog` disables tracking (`src/lib/tracking.ts`) and emits an `X-Robots-Tag: noindex` header (`next.config.mjs`). Code is promoted via branch, never via image.

## Architecture

### Pure `.mjs` + hand-written `.d.mts`, effects in `.ts`

Business logic lives in dependency-free `.mjs` modules with adjacent `.d.mts` type declarations; fetch/Next/logging glue lives in `.ts` wrappers. This lets `node --test` run the logic directly with no TS build step. Follow this pattern for any new testable logic. Examples:

- `src/lib/public-billing-catalog.mjs` + `billing-catalog-server.ts`
- `src/lib/blog-source.mjs` + `blog.ts`
- `src/lib/commercial-lead-*.mjs` + `commercial-leads.ts`

### Tracking allowlist (LGPD-critical)

`src/lib/tracking-events.mjs` defines the only events and payload fields that may reach GA4/Meta. Unknown event or field **throws** — the plans form collects name/email/phone/CNPJ and none of it may be sent to analytics. To add a tracked field, add it to `ALLOWED_FIELDS` explicitly; never bypass `buildTrackingEvent`.

### Degradation with a visible `source` field

External data sources never fail silently — they return a `source`/state field that travels in the response and is asserted in tests:

- **Billing catalog**: live fetch → validated snapshot (≤7 days) → unavailable. Read via `getLandingBillingCatalog()`.
- **Blog**: Supabase REST → local editorial seed (`src/content/blog-posts.ts`). States: `live` / `empty` / `fallback` / `unconfigured` (see `blog-source.mjs`; `empty` is healthy, the other two are degraded). Health endpoint: `/api/blog/status`.

### Content automation

`/api/content/*` routes (handoff, publish, hourly cron in `vercel.json`) are authenticated by `CONTENT_AUTOMATION_SECRET` via `src/lib/content-api-auth.ts` (timing-safe compare). Schema lives in `supabase/migrations/`. Docs: `docs/ROO-138-blog-cms.md`, `docs/ROO-145-motor-editorial-e-automacao.md`.

### Home page (LP)

- `src/app/page.tsx` only composes `src/components/lp/Lp*` sections; **all copy lives in `src/lib/lp-content.ts`** — edit text there, not in components.
- The `data-lp-home` attribute on the page activates the home palette via `body:has([data-lp-home])` in `globals.css`; that's how Header/Footer (in the layout) pick up the palette without affecting other routes.
- **Read `docs/design-v4.md` before touching LP visuals/motion.** Its rules look wrong at first sight and aren't: final state is the default state (no `opacity: 0` waiting for a trigger), `LpCountUp` renders the final value in served HTML, chart draw-in uses a curtain instead of `stroke-dasharray`.
- Colors come from CSS variables + a few fixed brand colors in `tailwind.config.ts` (`terracota`, `ocre`, `floresta`).

### Other pieces

- Emails: react-email components in `src/emails/`, sent via Resend (newsletter routes under `src/app/api/newsletter/`).
- Static asset caching: files under `public/` get 30-day cache headers (`next.config.mjs`) — if you replace a brand asset, **rename the file** or returning visitors keep the old one for up to 30 days.
- `.env.local.example` documents required env vars; without Supabase vars the blog runs on the local seed (`unconfigured`), which is normal in dev.
