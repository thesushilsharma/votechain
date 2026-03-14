import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { addCommentToTopic } from '@/lib/topicsStore'
import { ok, err } from '@/lib/api'
import { ipFromHeaders, rateLimit } from '@/lib/rateLimit'
import { validateComment } from '@/lib/validation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = rateLimit(`${ipFromHeaders(request.headers)}:comment`, 60, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(err('RATE_LIMITED', 'Too many requests'), { status: 429 })
    }
    const body = await request.json()
    const v = validateComment(body)
    if (!v.ok) {
      return NextResponse.json(err('BAD_REQUEST', v.message, v.details), { status: 400 })
    }
    const { content, author } = v.data
    const { id: topicId } = await params

    const newComment = {
      id: Date.now().toString(),
      topicId,
      author,
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    }

    addCommentToTopic(topicId, newComment)
    revalidatePath('/', 'page')
    return NextResponse.json(ok(newComment), { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(err('INTERNAL', 'Failed to create comment'), { status: 500 })
  }
}
