# Techspace design

Since 2026-11-19 the site uses the shared **Reader shell** (`src/app/reader-shell.css`,
`src/components/reader-shell.tsx`, rules in `READER.md`): Geist via next/font, the `--rs-*` light/dark
tokens, one top bar and a footer back to bookchaowalit.com (plus Source, Privacy, Status and the MCP endpoint).

- Home: page head, a GET search and category chips (counts follow the search; only categories the content has),
  a count line, then one row per MDX write-up (category, status, experience, a few tags). Empty state with a way back.
- Tool page (`/stack/[slug]`): back link, category and status tags, the h1, added date / experience / reading
  time, the real logo when the entry has one, a separate "Official site" link, my note, the MDX body
  (content h1 dropped, tables in a scroll region, code blocks focusable), then previous/next.
- Ratings and "projects used" are not shown: they are personal notes, not evidence, and the hub card says
  there is no map linking tools to projects.
- Floor: text ≥ 12px, targets ≥ 44px, 4.5:1 text in light and dark, forced colors.
