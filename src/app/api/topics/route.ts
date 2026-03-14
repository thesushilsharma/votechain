import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { addAllowedVoters, addTopic, getTopics } from '@/lib/topicsStore'
import type { Topic } from '@/types/topic'
import { ok, err } from '@/lib/api'
import { validateCreateTopic } from '@/lib/validation'
import { ipFromHeaders, rateLimit } from '@/lib/rateLimit'

export async function GET() {
  return NextResponse.json(ok(getTopics()))
}

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`${ipFromHeaders(request.headers)}:topics:create`, 20, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(err('RATE_LIMITED', 'Too many requests'), { status: 429 })
    }
    const body = await request.json()
    const v = validateCreateTopic(body)
    if (!v.ok) {
      return NextResponse.json(err('BAD_REQUEST', v.message, v.details), { status: 400 })
    }
    const { title, description, startTime, endTime, creator, allow } = v.data

    const newTopic: Topic = {
      id: Date.now().toString(),
      title,
      description: description || '',
      upvotes: 0,
      downvotes: 0,
      comments: [],
      startTime,
      endTime,
      status: startTime ? 'draft' : 'active',
      creator,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addTopic(newTopic)
    if (Array.isArray(allow) && allow.length > 0) {
      addAllowedVoters(newTopic.id, allow)
    }
    revalidatePath('/', 'page')
    return NextResponse.json(ok(newTopic), { status: 201 })
  } catch (error) {
    return NextResponse.json(err('INTERNAL', 'Failed to create topic'), { status: 500 })
  }
}
