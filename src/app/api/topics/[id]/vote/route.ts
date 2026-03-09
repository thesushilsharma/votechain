import { NextResponse } from 'next/server'
import { getTopicById, isEligible, hasVoted, recordVote } from '@/lib/topicsStore'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { type, voter } = await request.json()
    const { id: topicId } = await params

    if (!type || !voter || !['up', 'down'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type or voter' },
        { status: 400 }
      )
    }

    const topic = getTopicById(topicId)
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    if (!isEligible(topicId, voter)) {
      return NextResponse.json({ error: 'Not eligible to vote on this topic' }, { status: 403 })
    }

    if (hasVoted(topicId, voter)) {
      return NextResponse.json({ error: 'Already voted on this topic' }, { status: 409 })
    }

    const rec = recordVote(topicId, voter, type)
    return NextResponse.json({
      success: true,
      topicId,
      type,
      voter: rec.voter,
      timestamp: rec.timestamp,
      receiptId: rec.receiptId,
    })
  } catch (error) {
    console.error('Vote processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
