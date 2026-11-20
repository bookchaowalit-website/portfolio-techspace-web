/** Canonical origin for metadata, robots.txt and sitemap.xml (the site's own domain). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://techspace.bookchaowalit.com").replace(/\/$/, "");

/** The shared social card, used by the layout and every write-up page. */
export const OG_IMAGE = { url: "/og-image.svg", width: 1200, height: 630, alt: "Tech Space" };
