import { NextResponse } from 'next/server'
import type { Topic } from '@/types/topic'
import { getTopics, addTopic, addAllowedVoters } from '@/lib/topicsStore'

export async function GET() {
  return NextResponse.json(getTopics())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, creator, allow } = body

    if (!title || !creator) {
      return NextResponse.json(
        { error: 'Title and creator are required' },
        { status: 400 }
      )
    }

    const newTopic: Topic = {
      id: Date.now().toString(),
      title,
      description: description || '',
      upvotes: 0,
      downvotes: 0,
      comments: [],
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      status: startTime ? 'draft' : 'active',
      creator,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addTopic(newTopic)
    if (Array.isArray(allow) && allow.length > 0) {
      addAllowedVoters(newTopic.id, allow)
    }
    return NextResponse.json(newTopic, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
