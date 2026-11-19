import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /api/mcp is called cross-origin from bookchaowalit-devhub-frontend's Playground. Without this, the
  // browser blocks reading the response even though the route itself works (see devhub's PRODUCT.md).
  async headers() {
    return [
      {
        source: "/api/mcp",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  async redirects() {
    // The old portfolio link page now lives on the main site.
    return [{ source: "/more-projects", destination: "https://bookchaowalit.com/", permanent: true }];
  },
};

export default nextConfig;
