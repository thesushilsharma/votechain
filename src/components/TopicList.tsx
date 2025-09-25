"use client";

import { type Topic, useTopicsQuery } from "@/hooks/useTopicsQuery";

export default function TopicList({ initialData }: { initialData?: Topic[] }) {
  const { data, isLoading, error } = useTopicsQuery(initialData);

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div className="text-red-500">Failed to load topics</div>;

  return (
    <ul className="space-y-3 mt-4">
      {data?.map((t) => (
        <li key={t.id} className="border rounded p-3 flex items-center justify-between">
          <span className="font-medium">{t.title}</span>
          <span className="text-sm">
            👍 {t.upvotes} | 👎 {t.downvotes}
          </span>
        </li>
      ))}
    </ul>
  );
}