import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StackView } from "@/components/stack-views";
import { compileStack } from "@/lib/compile-stack";
import { getAllTechStacks, getAllTechStackSlugs, getTechStackBySlug } from "@/lib/mdx";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return getAllTechStackSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stack = getTechStackBySlug((await params).slug);
  return stack ? { title: `${stack.name} | Tech Space`, description: stack.description, alternates: { canonical: `/stack/${stack.slug}` } } : {};
}

export default async function StackPage({ params }: Props) {
  const stack = getTechStackBySlug((await params).slug);
  if (!stack) notFound();
  return <StackView stack={stack} stacks={getAllTechStacks()} body={await compileStack(stack.content)} />;
}
