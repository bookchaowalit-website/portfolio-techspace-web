import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/app/page.tsx", "src/app/stack/**/*.tsx", "src/app/layout.tsx", "src/app/sitemap.ts", "src/app/robots.ts", "src/components/**/*.tsx", "src/lib/mdx.ts", "src/lib/compile-stack.tsx", "next.config.ts"],
      thresholds: { lines: 85 },
    },
  },
});
