'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Topic } from '@/types/topic'
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

interface CommentModalProps {
  topic: Topic
  isOpen: boolean
  onClose: () => void
  onSubmitComment: (content: string) => void
}

export function CommentModal({ topic, isOpen, onClose, onSubmitComment }: CommentModalProps) {
  const { evmAddress } = useEvmAddress()
  const { isSignedIn } = useIsSignedIn();
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const MAX_LEN = 280

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !isSignedIn) return

    setIsSubmitting(true)
    try {
      await onSubmitComment(comment.trim())
      setComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const closeOnOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!isSubmitting && comment.trim() && isSignedIn) {
        void handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comments-title"
      onClick={closeOnOverlay}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      tabIndex={-1}
    >
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle id="comments-title" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments
              </CardTitle>
              <CardDescription className="mt-1">
                {topic.title}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {topic.comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              topic.comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium">
                      {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {comment.upvotes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      {comment.downvotes}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {isSignedIn ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                ref={textareaRef}
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={MAX_LEN}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                aria-label="Comment"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {comment.length}/{MAX_LEN}
                </span>
                <span className="text-xs text-muted-foreground">
                  Press Ctrl/Cmd + Enter to submit
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !comment.trim() || comment.length > MAX_LEN}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center text-muted-foreground py-4 space-y-3">
              <p>Sign in with your wallet to post comments</p>
              <div className="flex justify-center">
                <AuthButton />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
