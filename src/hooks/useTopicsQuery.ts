'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries'
import { Topic } from '@/types/topic'

export async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch('/api/topics', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch topics')
  return res.json()
}

export function useTopicsQuery(initialData?: Topic[]) {
  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: fetchTopics,
    initialData,
  })
}
