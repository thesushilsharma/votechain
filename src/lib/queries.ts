export const queryKeys = {
  topics: ["topics"] as const,
  topic: (id: string) => ["topic", id] as const,
};