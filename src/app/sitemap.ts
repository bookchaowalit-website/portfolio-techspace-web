import type { MetadataRoute } from "next";
import { getAllTechStackSlugs } from "@/lib/mdx";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...getAllTechStackSlugs().map((slug) => ({ url: `${SITE_URL}/stack/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
