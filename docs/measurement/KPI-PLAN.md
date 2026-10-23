---
title: "TechSpace — KPI and Instrumentation Plan"
status: draft
created: 2026-10-22
updated: 2026-10-22
description: "How the TechSpace stack catalog and its MCP server would be measured, what is live today (Sentry errors only) and what is planned."
template: architecture-docs templates/sdlc/kpi-and-instrumentation-plan.md
---

# TechSpace — KPI and Instrumentation Plan

## Document control

| Field | Value |
|---|---|
| Product | bookchaowalit-website/portfolio-techspace-web (https://techspace.bookchaowalit.com) |
| Version / status | 0.1 / **draft** — definitions only; no product analytics is live, no baselines captured |
| Metric owner | Owner (bookchaowalit) |
| AI maker | Claude Code (b-tier-b wave, 2026-10-22) |
| Analytics source of truth | none yet. Product analytics: owner decision **D4** chose PostHog (free tier), but no PostHog account or key exists yet, so nothing is sent. Sentry (errors only, `@sentry/nextjs`) is the only live signal once the deployment carries this commit. `@vercel/analytics` and `@vercel/speed-insights` components are mounted in `src/app/layout.tsx`; whether Web Analytics is enabled on the Vercel project is not verified and is not used as a KPI source. |
| Next review | 2026-11-15 (Big Loop milestone M1) |

## KPI tree

```text
OBJ-01 A visitor (human or MCP client) finds a tool in the catalog and reads why it was used
  └─ KPI-O-01 Write-up reach: sessions that open a /stack/[slug] page / sessions on /
       ├─ KPI-L-01 Filter use: sessions that apply a category/status/level filter / sessions on /
       ├─ KPI-L-02 MCP tool calls per week (tools/call, by tool name)
       ├─ KPI-G-01 Client and server error rate: Sentry error events / page views (guardrail)
       └─ KPI-G-02 MCP error rate: JSON-RPC error responses / MCP requests (guardrail)
```

## KPI definitions

| KPI ID | Type | Formula | Source | Baseline | Target | Alert |
|---|---|---|---|---|---|---|
| KPI-O-01 | outcome | sessions with `stack_opened` / sessions with `catalog_viewed` | planned PostHog events (D4) | not measured | ≥ 30% | — |
| KPI-L-01 | leading | sessions with `filter_applied` / sessions with `catalog_viewed` | planned PostHog events (D4) | not measured | ≥ 15% | — |
| KPI-L-02 | leading | count of `mcp_tool_called` per ISO week, by `tool` | planned server log/event (D4) | not measured | > 0 weekly | — |
| KPI-G-01 | guardrail | Sentry error events / page views | Sentry project `portfolio-techspace-web` (org personal-yu0) | not measured | < 1% | any new issue |
| KPI-G-02 | guardrail | JSON-RPC error responses / MCP requests | planned server log (D4) | not measured | < 2% | > 10% in a day |

Rates are "not measurable" below 100 sessions (or 50 MCP requests) in the window.

## Event and data specification (planned, not implemented)

| Event | Fired when | Properties | PII |
|---|---|---|---|
| `catalog_viewed` | `/` renders | `stack_count` | none |
| `filter_applied` | a category/status/level filter changes | `filter`, `value` | none |
| `stack_opened` | `/stack/[slug]` renders | `slug` | none |
| `mcp_tool_called` | server handles `tools/call` | `tool`, `ok` (bool) | none: no arguments, IP or token is recorded |

Sentry events are scrubbed by `src/lib/sentry.ts` (no request, user, breadcrumbs, extra or stack-frame locals; tracing off).

## Instrumentation verification (before G10)

| # | Check | Result |
|---|---|---|
| 1 | Events fire once per action | not run: events not implemented (D4: PostHog chosen, no account/key yet) |
| 2 | No PII in events | by design (table above); Sentry scrubbing covered by `src/lib/sentry.test.ts` |
| 3 | Dashboard | none |
| 4 | Sentry receives errors from production | not verified: the live build (D9a patch deploy, 2026-10-23) predates this change; later changes wait for D9 |
| 5 | Baselines captured | waived — dated action: capture after the PostHog key exists (D4) and the next deploy (D9), by 2026-11-30 |
| 6 | Consent | not needed for Sentry error-only reporting; needed before PostHog events ship (D4) |
