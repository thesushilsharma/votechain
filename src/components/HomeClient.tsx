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

   const handleCreateTopic = async (data: {
     title: string
     description: string
     startTime?: Date
     endTime?: Date
   }) => {
     if (!account) return

     try {
       await createTopic({
         ...data,
         creator: account,
       })
       setRefreshKey(prev => prev + 1)
     } catch (error) {
       console.error('Failed to create topic:', error)
     }
   }

   const handleVote = async (topicId: string, type: 'up' | 'down') => {
     if (!account) return

     try {
       await voteTopic({
         topicId,
         type,
         voter: account,
       })
     } catch (error) {
       console.error('Failed to vote:', error)
     }
   }

   const handleComment = (topicId: string) => {
     const topic = topics?.find(t => t.id === topicId)
     if (topic) {
       setSelectedTopic(topic)
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
     </div>
   )
 }
