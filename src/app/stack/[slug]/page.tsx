import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StackView } from "@/components/stack-views";
import { compileStack } from "@/lib/compile-stack";
import { OG_IMAGE } from "@/lib/site";
import { getAllTechStacks, getAllTechStackSlugs, getTechStackBySlug } from "@/lib/mdx";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return getAllTechStackSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stack = getTechStackBySlug((await params).slug);
  if (!stack) return {};
  const title = `${stack.name} | Tech Space`;
  const url = `/stack/${stack.slug}`;
  // A page-level openGraph/twitter replaces the layout's, so each write-up sets them in full.
  return {
    title,
    description: stack.description,
    alternates: { canonical: url },
    openGraph: { type: "article", locale: "en_US", url, title, description: stack.description, siteName: "Tech Space", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description: stack.description, images: [OG_IMAGE.url] },
  };
}

export default async function StackPage({ params }: Props) {
  const stack = getTechStackBySlug((await params).slug);
  if (!stack) notFound();
  return <StackView stack={stack} stacks={getAllTechStacks()} body={await compileStack(stack.content)} />;
}
