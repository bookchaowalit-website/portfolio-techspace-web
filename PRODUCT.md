# Product

<!-- impeccable:product-schema 1 -->

> Product truth inferred from the existing README, routes, data, and implementation. Confirm any missing product decisions in a future init pass.

## Platform

web

## Users

Developers, collaborators, and technically minded interviewers who want to understand the tools and frameworks behind Bookchaowalit's work.

## Product Purpose

TechSpace catalogs tools and frameworks that have actually been used, with a short MDX write-up for what each is for, why it was chosen, and what might happen next. Success means a visitor can browse by category and move from a stack entry into its evidence-rich explanation.

## Positioning

It is a working-use catalog with case notes, not a badge wall or an unqualified list of skills.

## Capabilities and Constraints

- Filterable stack grid and individual stack write-up routes.
- Local data and MDX content are the source of truth.
- The site exposes MCP and REST-style discovery routes for the catalog.
- Do not invent proficiency scores, client claims, or adoption metrics.

## Evidence on Hand

- `src/data/tech-stacks.ts`
- `src/lib/mdx.ts`
- `src/components/`
- Existing stack icons and the README.

## Product Principles

- Every listed tool earns its place through a real use note.
- Discovery should lead naturally to evidence.
- The catalog is useful to both a human reader and an API client.

## What works today (checked 2026-10-22)

- `/` renders the stacks found under `content/stacks/**.mdx` (6 today: React, Next.js, TypeScript, Rust, Roboflow,
  Databricks) as a grid filterable by category, status and experience level; `/stack/[slug]` renders each write-up.
- `/api/mcp` is a working MCP Streamable HTTP server with 7 tools (`roll_dice`, `list_stacks`, `get_stack`,
  `search_stacks`, `site_summary`, `page_summary`, `render_stack_markdown`) plus REST companions under `/api/mcp/*`.
  Live `tools/list` answered on 2026-10-22. Bearer auth is optional (`MCP_API_TOKEN`); the live endpoint is public.
- Errors are reported to Sentry (errors only, PII scrubbed) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What it does not do

- The MCP tools read `src/data/tech-stacks.ts` (12 entries), not the 6 MDX write-ups the web page shows, so the two
  surfaces disagree on what is in the catalog.
- No project-to-technology relationship map, no "100+ projects" and no usage-frequency data. The portfolio card
  claimed those (card claims review, 2026-10); none is built.
- No product analytics yet (D4 chose PostHog free tier; no account or key exists); see `docs/measurement/KPI-PLAN.md`.

## Live and deploy state

- Live: https://techspace.bookchaowalit.com (HTTP 200 on 2026-10-22).
- The Vercel project is linked to the old repository name and is deployed by CLI only; pushes to `main` do not deploy.
  The Next.js 15.5.28 / sharp 0.35.5 security patch was deployed on 2026-10-23 (D9a). Later changes on `main`,
  including Sentry, reach the live site only after the owner reconnects Vercel Git (owner action D9).
