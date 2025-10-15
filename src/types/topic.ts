export interface Topic {
  id: string
  title: string
  description?: string
  upvotes: number
  downvotes: number
  comments: Comment[]
  startTime?: Date | string
  endTime?: Date | string
  status: 'draft' | 'active' | 'ended'
  creator: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Comment {
  id: string
  topicId: string
  author: string
  content: string
  createdAt: Date | string
  upvotes: number
  downvotes: number
}

export interface Vote {
  id: string
  topicId: string
  voter: string
  type: 'up' | 'down'
  createdAt: Date | string
}