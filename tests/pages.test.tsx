import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "geist" }), Geist_Mono: () => ({ variable: "geist-mono" }) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
// next-mdx-remote/rsc needs the React Server Components build; render the source as plain text here.
vi.mock("next-mdx-remote/rsc", () => ({
  compileMDX: async ({ source, components }: { source: string; components: Record<string, (p: { children: string }) => unknown> }) => {
    components.h1({ children: "x" });
    components.table({ children: "x" });
    components.pre({ children: "x" });
    return { content: <div data-mdx>{source.slice(0, 200)}</div> };
  },
}));

import Home from "@/app/page";
import StackPage, { generateMetadata, generateStaticParams } from "@/app/stack/[slug]/page";
import RootLayout, { metadata } from "@/app/layout";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import nextConfig from "../next.config";
import { filterStacks, logoFor } from "@/components/stack-views";
import { stripLeadingTitle } from "@/lib/compile-stack";
import { getAllTechStacks } from "@/lib/mdx";

const search = (values: Record<string, string> = {}) => ({ searchParams: Promise.resolve(values) });
const slug = (value: string) => ({ params: Promise.resolve({ slug: value }) });

describe("home", () => {
  it("lists the six MDX write-ups with category chips, a count and the hub links", async () => {
    const html = renderToStaticMarkup(await Home(search()));
    expect(html).toContain("<h1>The tools I use, and why.</h1>");
    for (const name of ["React", "Next.js", "TypeScript", "Rust", "Roboflow", "Databricks"]) expect(html).toContain(name);
    expect(html).toContain("6 tools");
    expect(html).toContain('href="/?category=Frontend"');
    expect(html).toContain('href="https://bookchaowalit.com/"');
    expect(html).not.toMatch(/categorys|statuss/);
  });

  it("narrows by search and category, and ignores an unknown category", async () => {
    const html = renderToStaticMarkup(await Home(search({ q: "react", category: "Frontend" })));
    expect(html).toMatch(/Showing \d+ of 6 tools in Frontend for “react”/);
    expect(html).toContain('name="category" value="Frontend"');
    const unknown = renderToStaticMarkup(await Home(search({ category: "<b>x</b>" })));
    expect(unknown).toContain("6 tools");
    expect(unknown).not.toContain("&lt;b&gt;");
  });

  it("shows an empty state with a way back", async () => {
    const html = renderToStaticMarkup(await Home(search({ q: "cobol" })));
    expect(html).toContain("No tool matches");
    expect(html).toContain("Show all tools");
  });
});

describe("tool page", () => {
  it("shows the facts, the real logo, a separate official-site link, the body and previous/next", async () => {
    const html = renderToStaticMarkup(await StackPage(slug("react")));
    expect(html).toContain("<h1>React</h1>");
    expect(html).toContain('src="/icons/react.svg"');
    expect(html).toContain('href="https://react.dev"');
    expect(html).toContain("data-mdx");
    expect(html).not.toContain("# React:");
    expect(html).toMatch(/rel="(prev|next)"/);
  });

  it("404s an unknown tool and builds every tool page", async () => {
    await expect(StackPage(slug("cobol"))).rejects.toThrow("NOT_FOUND");
    expect(generateStaticParams()).toHaveLength(getAllTechStacks().length);
    expect((await generateMetadata(slug("rust"))).title).toBe("Rust | Tech Space");
    expect(await generateMetadata(slug("cobol"))).toEqual({});
    const meta = await generateMetadata(slug("react"));
    const og = meta.openGraph as { url?: string; title?: string; description?: string; images?: unknown[] };
    expect(meta.alternates?.canonical).toBe("/stack/react");
    expect(og.url).toBe("/stack/react");
    expect(og.title).toBe("React | Tech Space");
    expect(og.description).toBe(meta.description);
    expect(og.images).toHaveLength(1);
    expect((meta.twitter as { title?: string }).title).toBe("React | Tech Space");
  });
});

describe("site", () => {
  it("canonical, JSON-LD, sitemap and robots use techspace.bookchaowalit.com; /more-projects goes to the hub", async () => {
    const layout = renderToStaticMarkup(RootLayout({ children: <p>x</p> }));
    expect(layout).toContain('"url":"https://techspace.bookchaowalit.com"');
    expect(String(metadata.metadataBase)).toBe("https://techspace.bookchaowalit.com/");
    expect(metadata.alternates?.canonical).toBe("/");
    expect(sitemap().map((entry) => entry.url)).toContain("https://techspace.bookchaowalit.com/stack/react");
    expect(robots().sitemap).toBe("https://techspace.bookchaowalit.com/sitemap.xml");
    expect(await nextConfig.redirects!()).toContainEqual({ source: "/more-projects", destination: "https://bookchaowalit.com/", permanent: true });
    expect((await nextConfig.headers!())[0].source).toBe("/api/mcp");
  });
});

describe("helpers", () => {
  it("filters, hides placeholder logos and drops the content title", () => {
    const stacks = getAllTechStacks();
    expect(filterStacks(stacks, "", "AI/ML").shown.every((stack) => stack.category === "AI/ML")).toBe(true);
    expect(logoFor({ imageUrl: "/icons/placeholder.svg" })).toBeUndefined();
    expect(logoFor({})).toBeUndefined();
    expect(stripLeadingTitle("# Title\n\nBody")).toBe("\nBody");
  });
});

describe("deploy smoke markers", () => {
  it("the home and main-route markers in scripts/deploy-smoke.sh appear in the rendered pages", async () => {
    const { readFileSync } = await import("node:fs");
    const script = readFileSync("scripts/deploy-smoke.sh", "utf8");
    const marker = (name: string) => script.match(new RegExp(`^${name}="([^"]+)"`, "m"))![1];
    const route = marker("MAIN_ROUTE").replace("/stack/", "");
    expect(renderToStaticMarkup(await Home(search()))).toContain(marker("HOME_MARKER"));
    expect(renderToStaticMarkup(await StackPage(slug(route)))).toContain(marker("MAIN_MARKER"));
  });
});
