import { NextResponse } from 'next/server'
import { Topic } from '@/types/topic'

// Temporary in-memory storage for demo
const topics: Topic[] = [
  {
    id: '1',
    title: 'Welcome to VoteChain',
    description: 'This is the first topic on our decentralized voting platform!',
    upvotes: 15,
    downvotes: 2,
    comments: [
      {
        id: 'c1',
        topicId: '1',
        author: '0x1234...5678',
        content: 'Great to see this platform launching!',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        upvotes: 5,
        downvotes: 0,
      },
    ],
    status: 'active',
    creator: '0x1234567890123456789012345678901234567890',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: '2',
    title: 'Should we implement dark mode?',
    description: 'Community vote on adding dark mode support to the platform',
    upvotes: 12,
    downvotes: 3,
    comments: [],
    startTime: new Date('2024-01-16T00:00:00Z'),
    endTime: new Date('2024-01-23T23:59:59Z'),
    status: 'active',
    creator: '0x9876543210987654321098765432109876543210',
    createdAt: new Date('2024-01-15T14:00:00Z'),
    updatedAt: new Date('2024-01-15T14:00:00Z'),
  },
  {
    id: '3',
    title: 'Governance Token Distribution',
    description: 'Proposal for distributing governance tokens to early adopters',
    upvotes: 8,
    downvotes: 1,
    comments: [],
    startTime: new Date('2024-01-20T00:00:00Z'),
    endTime: new Date('2024-01-27T23:59:59Z'),
    status: 'draft',
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    createdAt: new Date('2024-01-15T16:00:00Z'),
    updatedAt: new Date('2024-01-15T16:00:00Z'),
  },
]

export async function GET() {
  return NextResponse.json(topics)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, creator } = body

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

    topics.push(newTopic)
    return NextResponse.json(newTopic, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}