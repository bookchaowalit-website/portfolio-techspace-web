import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("globals.css", () => {
  it("leaves scroll padding to the Reader shell (64px, 112px where the top bar can wrap to two rows)", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).not.toMatch(/scroll-padding-top/);
  });
});
