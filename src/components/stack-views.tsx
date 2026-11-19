import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleHeader, EmptyState, EntryList, Pager, Prose, Reader, ReaderFoot, ReaderHead, ReaderTop, ResultCount, SearchForm, TagFilter, formatDate, matchesQuery, neighbours } from "@/components/reader-shell";
import type { MDXTechStack } from "@/types/mdx-tech-stack";

const SOURCE = "https://github.com/bookchaowalit-website/portfolio-techspace-web";
const NOTE = "Hand-written notes on the tools I use, one MDX file each. Status and experience are my own reading, not a benchmark.";

export function Frame({ children, current }: { children: ReactNode; current?: "tools" }) {
  return (
    <Reader>
      <ReaderTop name="Tech Space" tagline="Tools I use, and why" links={[{ href: "/", label: "Tools", current: current === "tools" }]} />
      <main id="main" className="rs-main">{children}</main>
      <ReaderFoot source={SOURCE} links={[{ href: "/api/mcp/discovery", label: "MCP endpoint" }]} note={NOTE} />
    </Reader>
  );
}

/** Stacks matching the search words; category counts follow the search so a chip shows what clicking it gives. */
export function filterStacks(stacks: MDXTechStack[], query: string, category: string) {
  const matching = stacks.filter((stack) => matchesQuery([stack.name, stack.description, stack.category, stack.notes ?? "", ...stack.tags], query));
  const shown = matching.filter((stack) => !category || stack.category === category);
  const categories = [...new Set(stacks.map((stack) => stack.category))].sort();
  const counts = Object.fromEntries(categories.map((name) => [name, matching.filter((stack) => stack.category === name).length]));
  return { shown, categories, counts, matching: matching.length };
}

function homeHref(query: string, category: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

export function HomeView({ stacks, query, category }: { stacks: MDXTechStack[]; query: string; category: string }) {
  const { shown, categories, counts, matching } = filterStacks(stacks, query, category);
  return (
    <Frame current="tools">
      <ReaderHead
        eyebrow="Working reference"
        title="The tools I use, and why."
        lede="A short write-up per tool: what it is for, how I use it, and where I am with it. Each entry is one MDX file in the repository."
      />
      <div className="rs-toolbar">
        <SearchForm label="Search tools" placeholder="Name, tag or note" defaultValue={query} hidden={category ? { category } : {}} clearHref={homeHref("", category)} />
        <TagFilter
          label="Category"
          options={[
            { href: homeHref(query, ""), label: "All", count: matching, current: !category },
            ...categories.map((name) => ({ href: homeHref(query, name), label: name, count: counts[name], current: category === name })),
          ]}
        />
      </div>
      <ResultCount shown={shown.length} total={stacks.length} noun="tool" query={query || undefined} filter={category || undefined} />
      {shown.length ? (
        <EntryList
          entries={shown.map((stack) => ({
            href: `/stack/${stack.slug}`,
            title: stack.name,
            summary: stack.description,
            meta: [stack.category, stack.status, `${stack.experience} experience`],
            tags: stack.tags.slice(0, 4),
          }))}
        />
      ) : (
        <EmptyState title="No tool matches" action={<Link className="rs-button" href="/">Show all tools</Link>}>
          Nothing in {category || "the catalogue"} matches{query ? ` “${query}”` : ""}. Clear the search or pick another category.
        </EmptyState>
      )}
    </Frame>
  );
}

/** A real logo only: entries without one keep the placeholder file, which says nothing, so it is not shown. */
export function logoFor(stack: Pick<MDXTechStack, "imageUrl">): string | undefined {
  return stack.imageUrl && !stack.imageUrl.includes("placeholder") ? stack.imageUrl : undefined;
}

export function StackView({ stack, stacks, body }: { stack: MDXTechStack; stacks: MDXTechStack[]; body: ReactNode }) {
  const { previous, next } = neighbours(stacks, stacks.findIndex((item) => item.slug === stack.slug));
  const logo = logoFor(stack);
  return (
    <Frame>
      <article>
        <ArticleHeader
          back={{ href: "/", label: "All tools" }}
          tags={[stack.category, stack.status]}
          title={stack.name}
          lede={stack.description}
          meta={[`Added ${formatDate(stack.dateAdded)}`, `${stack.experience} experience`, ...(stack.readingTime ? [stack.readingTime.text] : [])]}
        />
        <div className="ts-links">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img className="ts-logo" src={logo} alt="" width={48} height={48} /> : null}
          {stack.url ? <a className="rs-button" href={stack.url} rel="noopener">Official site<span className="rs-sr"> of {stack.name}</span></a> : null}
        </div>
        {stack.notes ? <p className="ts-note"><strong>My note:</strong> {stack.notes}</p> : null}
        <Prose>{body}</Prose>
        <Pager
          label="More tools"
          previous={previous ? { href: `/stack/${previous.slug}`, title: previous.name, label: "Previous tool" } : undefined}
          next={next ? { href: `/stack/${next.slug}`, title: next.name, label: "Next tool" } : undefined}
        />
      </article>
    </Frame>
  );
}
