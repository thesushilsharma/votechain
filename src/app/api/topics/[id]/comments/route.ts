import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { content, author } = await request.json()
    const { id: topicId } = await params

    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      )
    }

    const newComment = {
      id: Date.now().toString(),
      topicId,
      author,
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    }

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}