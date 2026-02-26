"use client";

import { TopicCard } from "@/components/TopicCard";
import { Topic } from "@/types/topic";
import { useTopicsQuery } from "@/hooks/useTopicsQuery";

interface TopicListProps {
  initialData?: Topic[];
  onVote: (topicId: string, type: "up" | "down") => void;
  onComment: (topicId: string) => void;
}

export default function TopicList({
  initialData,
  onVote,
  onComment,
}: TopicListProps) {
  const { data, isLoading, error } = useTopicsQuery(initialData);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load topics</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try again later
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🗳️</div>
        <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
        <p className="text-muted-foreground">
          Be the first to create a topic for the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          onVote={onVote}
          onComment={onComment}
        />
      ))}
    </div>
  );
}
