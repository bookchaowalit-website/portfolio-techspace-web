import { HomeView } from "@/components/stack-views";
import { getAllTechStacks } from "@/lib/mdx";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const stacks = getAllTechStacks();
  // Only a category the content really has becomes the filter; anything else shows everything.
  const category = one(params.category);
  return <HomeView stacks={stacks} query={one(params.q).trim().slice(0, 80)} category={stacks.some((stack) => stack.category === category) ? category : ""} />;
}
