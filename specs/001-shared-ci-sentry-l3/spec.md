---
title: "SPEC-001 — Shared CI, Sentry error reporting and truthful product docs"
status: implemented
tags: [spec, sdd, tdd, ci, sentry, docs]
created: 2026-10-23
updated: 2026-10-23
description: "Move TechSpace CI onto the shared workflows with a security scan, report errors to Sentry without personal data, and make PRODUCT.md and the KPI plan match the code."
---

# SPEC-001 — Shared CI, Sentry error reporting and truthful product docs

Standard: ADR-0004 (TDD + SDD). Plan: Big Loop Plan 2026-10-21, Tier B batch (b-tier-b). Roadmap:
`repository-catalog/roadmaps/tier-b-showcase.yaml` (ts-g1 / ts-t1).

## 1. Problem and intent

- **Problem:** CI (`mcp.yml`, BOO-235) ran its own lint / vitest / build job, with no typecheck and no security scan; the
  app reported no errors anywhere; `npm test` started vitest in watch mode; PRODUCT.md did not say what is missing (the
  portfolio card claimed a 100+ project relationship map and usage frequency) or how the live site is deployed; there was
  no KPI plan.
- **Outcome:** CI runs the shared `ci-node.yml` (install, lint, `tsc --noEmit`, `vitest run`, build) and `security.yml`
  (gitleaks, Semgrep, OSV-Scanner, Trivy) on every push and PR, with no path filter; errors reach Sentry with request,
  user, URL and query data removed; PRODUCT.md and `docs/measurement/KPI-PLAN.md` describe what exists.

## 2. Workflow mapping (`.github/workflows/ci.yml`, renamed from `mcp.yml`)

| Check (BOO-235) | Before | After |
|---|---|---|
| lint | `npm run lint` | shared `ci-node.yml` lint (auto → `npm run lint`) |
| tests incl. MCP tools/controllers/client/rate limiter | `npm test -- --run` | `npm test` (`vitest run`), `require-tests: true` |
| build | `npm run build` | `build-command: NEXT_TELEMETRY_DISABLED=1 npm run build` |
| typecheck | — | `tsc --noEmit` (tsconfig `strict: true`) |
| security scan | — | shared `security.yml` |

Public repo, so both jobs use the default GitHub-hosted `ubuntu-24.04` runner. Pinned to v1.1.1 (`87dc5e1`).

## 3. Acceptance

| AC | Given / when / then | Test |
|---|---|---|
| AC-01 | Without `NEXT_PUBLIC_SENTRY_DSN` Sentry is disabled | `src/lib/sentry.test.ts` "stays disabled…" |
| AC-02 | With a DSN: errors only (no PII, tracing, trace headers, breadcrumbs, transactions) | `src/lib/sentry.test.ts` "reports errors only…" |
| AC-03 | `request`, `user`, `breadcrumbs`, `extra` and stack-frame locals are removed | `src/lib/sentry.test.ts` scrubEvent cases |
| AC-04 | `contexts.nextjs.request_path` (added by `captureRequestError`) is dropped, only platform contexts kept; query strings are stripped from `transaction` and tags, `tags.url` removed | `src/lib/sentry.test.ts` "drops the request path…" |
| AC-04b | `?query` and `#hash` are stripped from URLs in exception messages, frame `filename`/`abs_path` and `debug_meta` images | `src/lib/sentry.test.ts` "strips query strings from URLs…" |
| AC-05 | Existing behaviour unchanged (MCP tools, controllers, client, rate limiter) | 4 existing test files, 19 tests |
| AC-06 | PRODUCT.md matches the card claims review row `techspace` and the code | review (section 5) |

Red first: 2026-10-22 the new test failed with `Failed to load url ./sentry` (no module). 2026-10-23 the hardened test
(shared reference after a security review) failed 1/5 ("drops the request path that captureRequestError adds and strips
query strings") against the first scrubber copy, then passed 5/5 with the allowlist version. A second review added "strips query strings from URLs in the exception message, frames and debug images": red 1/6 against the allowlist copy, green 6/6 after the update. Full suite: 5 files, 24 tests green.

## 4. Interfaces

`@sentry/nextjs` ^11.8.0; `src/lib/sentry.ts` (options + scrubber), `src/instrumentation.ts` (Node/Edge `register` and
`onRequestError`), `src/instrumentation-client.ts`. No `withSentryConfig`, no source-map upload, no auth token in the build.
`package.json` `test` is now `vitest run` (CI-safe).

Security scan findings fixed (first shared-CI run, 2026-10-23): `@modelcontextprotocol/sdk` 1.26.0 → 1.32.1
(GHSA-22jm-h49p-29qw and four more; `mcp-handler` 1.1.0 pins the SDK to exactly 1.26.0, so an `overrides` entry forces
1.32.1 — verified against the built server with `initialize`, `tools/list` (7 tools) and `tools/call get_stack`);
vitest 1 → 4.1.12 (vite, tinypool, esbuild, @vitest/mocker); `postcss` ≥ 8.5.28 (next pins 8.4.31); `ip-address`
10.7.4. `osv-scanner.toml` ignores braces GHSA-vfj7-8cjw-p6xm (no fixed release, dev-only) until 2027-01-31.

## 5. Docs truth check

PRODUCT.md now states: the web grid shows the 6 MDX write-ups, while the MCP tools read the 12 entries in
`src/data/tech-stacks.ts` (the two surfaces disagree); no relationship map, no project counts, no usage frequency;
live MCP endpoint is public (no `MCP_API_TOKEN`); deploy state below.

## 6. UI review

No UI or copy changed; this pass proves the Sentry and dependency changes break nothing. Local production build
(`next build` + `next start`) captured at 375 / 768 / 1440 (`~/work/b-tier-b/shots/portfolio-techspace-web-l3/`) and the
live site for comparison (`~/work/b-tier-b/shots/portfolio-techspace-web-live/`). Looked at the images: home renders the
hero, the 6-entry count and all 6 cards with field notes at every width, no horizontal overflow; the filter register shows
at 1440. `/stack/react` renders the full write-up. Found (pre-existing, identical on live): at 375 the stack page overflows
by 21 px (the header "Visit Site" link and the tag row are clipped on the right); two 404 console errors for missing static
assets on every page. Neither is caused by this change; logged as follow-ups. Sign-off: Claude Code (b-tier-b), 2026-10-23.

## 7. Out of scope (follow-ups)

- ts-g2 / ts-t3: a route-level test of `/api/mcp` (initialize, tools/list, tools/call).
- One catalog source for both the web grid and the MCP tools.
- ts-t4: README live link still points at the `vercel.app` alias.
- ts-t5: axe pass on the home and a stack page.
- `/stack/[slug]` 21 px horizontal overflow at 375 and two 404 asset requests (pre-existing, also on live).
- PostHog events (D4: PostHog free tier chosen, no account/key yet).

## 8. Deploy state

The Vercel project is CLI-deployed only (linked to the old repo name). The Next.js 15.5.28 patch was deployed on
2026-10-23 (D9a, `affa651`); this spec's changes are on `main` only and reach https://techspace.bookchaowalit.com after
the owner reconnects Vercel Git (D9). `deploy_workflow` stays a gap for that reason.
