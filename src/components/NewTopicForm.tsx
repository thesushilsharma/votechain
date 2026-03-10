'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { Calendar, Clock } from 'lucide-react'

interface NewTopicFormProps {
  onSubmit: (data: {
    title: string
    description: string
    startTime?: Date
    endTime?: Date
    restrictToSelf?: boolean
  }) => void
}

export default function NewTopicForm({ onSubmit }: NewTopicFormProps) {
  const { isSignedIn } = useIsSignedIn();
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [restrictToSelf, setRestrictToSelf] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        restrictToSelf,
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setStartTime('')
      setEndTime('')
      setIsScheduled(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Connect your wallet to create topics
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗳️ Create New Topic
        </CardTitle>
        <CardDescription>
          Start a new discussion or proposal for the community to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Topic title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scheduled"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="scheduled" className="text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Schedule voting period
            </label>
          </div>

          {isScheduled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-time" className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3" />
                  Start Time
                </label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="end-time" className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3" />
                  End Time
                </label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="restrict-self"
              checked={restrictToSelf}
              onChange={(e) => setRestrictToSelf(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="restrict-self" className="text-sm">
              Restrict voting to my wallet only (allowlist)
            </label>
          </div>

          <Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full">
            {isSubmitting ? 'Creating...' : 'Create Topic'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
