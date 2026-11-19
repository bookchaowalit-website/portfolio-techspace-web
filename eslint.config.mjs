import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
  ...nextVitals,
  ...nextTs,
  // The shared Reader shell test renders plain <a> fixtures on purpose (the shell stays framework-free).
  { files: ["tests/**"], rules: { "@next/next/no-html-link-for-pages": "off" } },
]);
