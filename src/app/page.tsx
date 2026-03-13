import HomeClient from "@/components/HomeClient";
import Providers from "@/context/coinbase-provider";
import { QueryProvider } from "@/context/query-provider";

export default async function Home() {
  const res = await fetch(`${process.env.API_BASE_URL ?? ""}api/topics`, {
    next: { tags: ["topics"] },
  });
  const initialTopics = res.ok ? await res.json() : undefined;
  return (
    <Providers>
      <QueryProvider>
        <HomeClient initialTopics={initialTopics} />
      </QueryProvider>
    </Providers>
  );
}
