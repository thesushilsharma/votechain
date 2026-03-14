import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getTopicById, hasVoted, isEligible, recordVote } from '@/lib/topicsStore'
import { ok, err } from '@/lib/api'
import { ipFromHeaders, rateLimit } from '@/lib/rateLimit'
import { validateVote } from '@/lib/validation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = rateLimit(`${ipFromHeaders(request.headers)}:vote`, 60, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(err('RATE_LIMITED', 'Too many requests'), { status: 429 })
    }
    const body = await request.json()
    const v = validateVote(body)
    if (!v.ok) {
      return NextResponse.json(err('BAD_REQUEST', v.message, v.details), { status: 400 })
    }
    const { type, voter } = v.data
    const { id: topicId } = await params

    const topic = getTopicById(topicId)
    if (!topic) {
      return NextResponse.json(err('NOT_FOUND', 'Topic not found'), { status: 404 })
    }

    if (!isEligible(topicId, voter)) {
      return NextResponse.json(err('FORBIDDEN', 'Not eligible to vote on this topic'), { status: 403 })
    }

    if (hasVoted(topicId, voter)) {
      return NextResponse.json(err('CONFLICT', 'Already voted on this topic'), { status: 409 })
    }

    const rec = recordVote(topicId, voter, type)
    revalidatePath('/', 'page')
    return NextResponse.json(ok({
      topicId,
      type,
      voter: rec.voter,
      timestamp: rec.timestamp,
      receiptId: rec.receiptId,
    }))
  } catch (error) {
    console.error('Vote processing error:', error)
    return NextResponse.json(err('INTERNAL', 'Failed to process vote'), { status: 500 })
  }
}
