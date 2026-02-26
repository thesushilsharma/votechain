 import type { Topic, Comment, Vote } from "@/types/topic";
 
 export type CreateTopicInput = {
   title: string;
   description: string;
   startTime?: Date;
   endTime?: Date;
   creator: string;
 };
 
 export async function createTopic(input: CreateTopicInput): Promise<Topic> {
   const response = await fetch("/api/topics", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify(input),
   });
 
   if (!response.ok) {
     throw new Error("Failed to create topic");
   }
 
   return response.json();
 }
 
 export type VoteTopicInput = {
   topicId: string;
   type: Vote["type"];
   voter: string;
 };
 
 export async function voteTopic(input: VoteTopicInput): Promise<void> {
   const response = await fetch(`/api/topics/${input.topicId}/vote`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       type: input.type,
       voter: input.voter,
     }),
   });
 
   if (!response.ok) {
     throw new Error("Failed to vote on topic");
   }
 }
 
 export type CreateCommentInput = {
   topicId: string;
   content: string;
   author: string;
 };
 
 export async function createComment(
   input: CreateCommentInput,
 ): Promise<Comment> {
   const response = await fetch(
     `/api/topics/${input.topicId}/comments`,
     {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         content: input.content,
         author: input.author,
       }),
     },
   );
 
   if (!response.ok) {
     throw new Error("Failed to create comment");
   }
 
   return response.json();
 }
