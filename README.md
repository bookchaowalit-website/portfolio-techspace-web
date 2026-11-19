# TechSpace

A personal tech-stack catalog on the shared Reader shell (`READER.md`): a
searchable, category-filterable list of tools (React, Next.js, TypeScript, Rust, Databricks, Roboflow, ...),
each with a real MDX write-up under `content/stacks/<category>/<slug>.mdx` —
what it's for, why I picked it, what I'd use it for next. Not a "here's my
skills" badge wall; each entry is a short case for the tool.

Live: https://techspace.bookchaowalit.com
Mobile companion: [bookchaowalit-techspace-mobile](https://github.com/bookchaowalit-mobile/bookchaowalit-techspace-mobile)
Portfolio: [bookchaowalit.com](https://bookchaowalit.com)

## Routes

| Route | What it is |
|---|---|
| `/` | Tool list: search (`?q=`) and category chips (`?category=`) |
| `/stack/[slug]` | One stack's MDX write-up (statically generated) |
| `/more-projects` | 308 to https://bookchaowalit.com/ |
| `/api/mcp` | Real MCP server (JSON-RPC / Streamable HTTP) — 7 tools, see below |
| `/api/mcp/discovery`, `/schema`, `/data/stacks`, `/health` | Plain REST-style companions to the MCP tools, for clients that don't speak MCP |

## The MCP server

This is the one part of the app with actual protocol complexity: `/api/mcp`
uses the [`mcp-handler`](https://www.npmjs.com/package/mcp-handler) SDK +
`zod` schemas to expose 7 tools (`roll_dice`, `list_stacks`, `get_stack`,
`search_stacks`, `site_summary`, `page_summary`, `render_stack_markdown`)
over the real MCP Streamable HTTP transport, with optional bearer-token auth
and a rate limiter. It's also called cross-origin from
[bookchaowalit-devhub-frontend](https://github.com/bookchaowalit-website/bookchaowalit-devhub-frontend)'s
live Playground, which is what first surfaced the bugs below.

### What a from-scratch audit found here

Nothing about this route had ever actually been exercised end-to-end before
this pass — the vitest suite tests the tool *functions* directly, not the
route, and `next build`'s static analysis can't catch a wrong runtime path.
Two independent, stacked bugs meant **every real request to `/api/mcp` — the
MCP protocol endpoint, not the REST-style siblings — was broken**, and a
third meant a documented tool silently didn't exist:

1. **`createMcpHandler`'s default endpoint path didn't match where the route
   is mounted.** Its default `streamableHttpEndpoint` is `/mcp` (derived from
   an empty `basePath`), but this route lives at `/api/mcp`. The handler's
   internal `url.pathname === streamableHttpEndpoint` check never matched a
   real request, so every call fell through to a hardcoded 404. Fixed by
   passing `{ basePath: '/api' }` as the handler's config.
2. **The exported handler was called as if it were an object with
   `.GET`/`.POST`/`.DELETE` methods** (`(authHandler as unknown as
   HandlerMethods).POST(request)`), but `withMcpAuth` and `createMcpHandler`
   both just return a single callable function `(request) => Response`. The
   cast silently hid the mismatch from TypeScript; at runtime it threw
   `TypeError: ... .POST is not a function` on every request. Fixed by
   calling `authHandler(request)` directly from `GET`/`POST`/`DELETE`.
3. **`roll_dice` was documented (`docs/MCP.md`) and fully implemented and
   tested (`src/lib/mcp/tools.ts`, `tools.test.ts`) but never registered as
   an actual `server.tool(...)` in the route** — it was an unused import
   that looked like dead code and almost got deleted as one. Fixed by
   registering it as the 7th tool.

All three verified together, live: `initialize` → `tools/list` (all 7 tools
present) → `tools/call` for both `roll_dice` and `list_stacks`, checked
against the running server's own log for silence (no thrown errors), not
just HTTP status codes.

Also found and fixed in this pass, unrelated to MCP protocol wiring:

- A test in `client.test.ts` asserted against `fn.mock[0]` instead of the
  correct vitest API `fn.mock.calls[0]` — a test-only bug; the client code
  itself was already correct.
- `next.config.ts` had both `eslint.ignoreDuringBuilds` and
  `typescript.ignoreBuildErrors` set, which is how 9 implicit-`any` params
  and 2 unguarded-null test assertions had accumulated invisibly — `next
  build` was never actually checking either. Fixed all 10, then removed both
  flags so a real regression fails the build again.
- `@modelcontextprotocol/sdk` was never declared as a direct dependency —
  it was pulled in only as `mcp-handler`'s peer dependency, resolved
  implicitly. `mcp-handler@1.1.0` pins that peer to an *exact* version
  (`1.26.0`, no range), which is why it's now declared explicitly at that
  exact version rather than left implicit.
- `next` was bumped from an exact `15.5.9` to `^15.5.22`, and `@hono/node-server`
  (a transitive dependency via the MCP SDK) is pinned via an `overrides`
  entry to `^2.0.5` — together clearing 17 of 24 `npm audit` findings
  without any breaking major-version bump. The remaining 7 all require
  Next.js 15→16 or vitest 1→4, which weren't attempted here.
- A dead `categories` object in `more-projects/page.tsx` — defined, then
  never referenced; the JSX below it hardcodes every card directly. Same
  pattern found in several sibling repos this pass.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
`@next/mdx` for stack write-ups · `mcp-handler` + `zod` for the MCP server ·
vitest for the MCP layer's tests.

## Local development

```bash
npm install
npm run dev
npm run test        # vitest, MCP layer only by default via test:mcp
npm run build
```
