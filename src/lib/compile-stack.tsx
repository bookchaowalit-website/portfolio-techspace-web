import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { TableScroll } from "@/components/reader-shell";

/** The write-up starts with its own "# Name: …" line; the page already has the h1, so drop it. */
export function stripLeadingTitle(source: string): string {
  return source.replace(/^\s*#\s[^\n]*\n/, "");
}

/** Compiles a write-up for the Reader shell's prose: GFM tables in a scroll region, content h1 as h2, scrollable code. */
export async function compileStack(source: string) {
  const { content } = await compileMDX({
    source: stripLeadingTitle(source),
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    components: {
      h1: ({ children }) => <h2>{children}</h2>,
      table: ({ children }) => <TableScroll label="Table"><table>{children}</table></TableScroll>,
      pre: ({ children }) => <pre tabIndex={0}>{children}</pre>,
    },
  });
  return content;
}
