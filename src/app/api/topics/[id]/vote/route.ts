import { NextResponse } from 'next/server'

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

    // For demo purposes, we'll just return success
    return NextResponse.json({
      success: true,
      topicId,
      type,
      voter,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Vote processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}