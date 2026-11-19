import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Font variables sit on <html>: the Reader shell tokens live on :root and read them from there.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const DESCRIPTION = "A catalogue of the tools Bookchaowalit uses, each with a short MDX write-up, plus an MCP endpoint over the catalogue.";

export const metadata: Metadata = {
  title: "Tech Space | Tools I use, and why | Bookchaowalit",
  description: DESCRIPTION,
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_US", url: "/", title: "Tech Space | Tools I use, and why", description: DESCRIPTION, siteName: "Tech Space", images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Tech Space" }] },
  twitter: { card: "summary_large_image", title: "Tech Space | Tools I use, and why", description: DESCRIPTION, images: ["/og-image.svg"] },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tech Space",
  url: SITE_URL,
  description: DESCRIPTION,
  author: { "@type": "Person", name: "Bookchaowalit", url: "https://bookchaowalit.com" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
