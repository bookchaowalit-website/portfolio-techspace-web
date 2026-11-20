import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { normalizeFrontmatter } from "@/lib/mdx";

describe("normalizeFrontmatter", () => {
  it("keeps an unquoted YAML dateAdded as a YYYY-MM-DD string", () => {
    const { data } = matter("---\nname: Example\ndateAdded: 2024-12-01\n---\nBody");
    expect(normalizeFrontmatter(data).dateAdded).toBe("2024-12-01");
  });
  it("leaves a quoted date untouched", () => {
    const { data } = matter('---\nname: Example\ndateAdded: "2023-01-01"\n---\nBody');
    expect(normalizeFrontmatter(data).dateAdded).toBe("2023-01-01");
  });
});
