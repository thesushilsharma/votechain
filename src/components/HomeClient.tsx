 'use client'

 import { useState } from 'react'
 import NewTopicForm from '@/components/NewTopicForm'
 import TopicList from '@/components/TopicList'
 import { CommentModal } from '@/components/CommentModal'
 import { Card, CardContent } from '@/components/ui/card'
 import type { Topic } from '@/types/topic'
 import { useTopicsQuery } from '@/hooks/useTopicsQuery'
 import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks'
 import { createComment, createTopic, voteTopic } from '@/lib/topicApi'

 export default function HomeClient() {
   const { evmAddress } = useEvmAddress()
   const { isSignedIn } = useIsSignedIn()
   const [refreshKey, setRefreshKey] = useState(0)
   const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
   const { data: topics } = useTopicsQuery()
   const account = isSignedIn ? evmAddress : null
  const [toast, setToast] = useState<string | null>(null)
  const [snapshotRoot, setSnapshotRoot] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

   const handleCreateTopic = async (data: {
     title: string
     description: string
     startTime?: Date
     endTime?: Date
    restrictToSelf?: boolean
   }) => {
     if (!account) return

     try {
      await createTopic({
         ...data,
         creator: account,
        allow: data.restrictToSelf ? [account] : undefined,
       })
       setRefreshKey(prev => prev + 1)
     } catch (error) {
       console.error('Failed to create topic:', error)
     }
   }

  const handleVote = async (topicId: string, type: 'up' | 'down') => {
     if (!account) return

     try {
      const res = await voteTopic({
         topicId,
         type,
         voter: account,
       })
      if (res?.receiptId) {
        showToast(`Vote recorded. Receipt: ${res.receiptId.slice(0, 20)}...`)
      } else {
        showToast('Vote recorded.')
      }
      setRefreshKey(prev => prev + 1)
     } catch (error) {
      const msg = (error as Error)?.message ?? 'Failed to vote'
      showToast(msg)
     }
   }

   const handleComment = (topicId: string) => {
     const topic = topics?.find(t => t.id === topicId)
     if (topic) {
       setSelectedTopic(topic)
     }
   }

  const handleViewSnapshot = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/snapshot`)
      if (!res.ok) throw new Error('Failed to fetch snapshot')
      const data = await res.json()
      setSnapshotRoot(data?.root ?? '')
      showToast(`Snapshot root: ${(data?.root ?? '').slice(0, 20)}...`)
    } catch (e) {
      showToast((e as Error)?.message ?? 'Snapshot error')
    }
  }

   const handleSubmitComment = async (content: string) => {
     if (!account || !selectedTopic) return

     try {
       await createComment({
         topicId: selectedTopic.id,
         content,
         author: account,
       })

       setSelectedTopic(null)
       setRefreshKey(prev => prev + 1)
     } catch (error) {
       console.error('Failed to post comment:', error)
     }
   }

   return (
     <div className="container mx-auto px-4 py-8 max-w-4xl">
       <div className="mb-8">
         <h1 className="text-3xl font-bold mb-2">Community Topics</h1>
         <p className="text-muted-foreground">
           Transparent, decentralized voting on the blockchain
         </p>
       </div>

       <div className="grid gap-8">
         <NewTopicForm onSubmit={handleCreateTopic} />

         <div>
           <h2 className="text-xl font-semibold mb-4">Active Discussions</h2>
           <TopicList
             key={refreshKey}
             onVote={handleVote}
             onComment={handleComment}
            onSnapshot={handleViewSnapshot}
           />
         </div>
       </div>

       <div className="grid md:grid-cols-3 gap-4 mt-12">
         <Card>
           <CardContent className="pt-6">
             <div className="text-center">
               <div className="text-2xl mb-2">🗓️</div>
               <h3 className="font-semibold">Scheduled Voting</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 Set custom start/end times for proposals
               </p>
             </div>
           </CardContent>
         </Card>

         <Card>
           <CardContent className="pt-6">
             <div className="text-center">
               <div className="text-2xl mb-2">⛓️</div>
               <h3 className="font-semibold">Immutable Records</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 Every vote is cryptographically recorded
               </p>
             </div>
           </CardContent>
         </Card>

         <Card>
           <CardContent className="pt-6">
             <div className="text-center">
               <div className="text-2xl mb-2">💬</div>
               <h3 className="font-semibold">On-Chain Comments</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 Public discussions tied to proposals
               </p>
             </div>
           </CardContent>
         </Card>
       </div>

       {selectedTopic && (
         <CommentModal
           topic={selectedTopic}
           isOpen={!!selectedTopic}
           onClose={() => setSelectedTopic(null)}
           onSubmitComment={handleSubmitComment}
         />
       )}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-muted text-foreground px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
     </div>
   )
 }
