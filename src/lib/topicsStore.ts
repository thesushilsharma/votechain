 import crypto from "crypto";
 import type { Topic } from "@/types/topic";
 
 export type VoteRecord = {
   voter: string;
   type: "up" | "down";
   timestamp: string;
   receiptId: string;
 };
 
 // Temporary in-memory storage for demo
 const topics: Topic[] = [
   {
     id: "1",
     title: "Welcome to VoteChain",
     description: "This is the first topic on our decentralized voting platform!",
     upvotes: 15,
     downvotes: 2,
     comments: [
       {
         id: "c1",
         topicId: "1",
         author: "0x1234...5678",
         content: "Great to see this platform launching!",
         createdAt: new Date("2024-01-15T10:00:00Z"),
         upvotes: 5,
         downvotes: 0,
       },
     ],
     status: "active",
     creator: "0x1234567890123456789012345678901234567890",
     createdAt: new Date("2024-01-15T09:00:00Z"),
     updatedAt: new Date("2024-01-15T09:00:00Z"),
   },
   {
     id: "2",
     title: "Should we implement dark mode?",
     description: "Community vote on adding dark mode support to the platform",
     upvotes: 12,
     downvotes: 3,
     comments: [],
     startTime: new Date("2024-01-16T00:00:00Z"),
     endTime: new Date("2024-01-23T23:59:59Z"),
     status: "active",
     creator: "0x9876543210987654321098765432109876543210",
     createdAt: new Date("2024-01-15T14:00:00Z"),
     updatedAt: new Date("2024-01-15T14:00:00Z"),
   },
   {
     id: "3",
     title: "Governance Token Distribution",
     description: "Proposal for distributing governance tokens to early adopters",
     upvotes: 8,
     downvotes: 1,
     comments: [],
     startTime: new Date("2024-01-20T00:00:00Z"),
     endTime: new Date("2024-01-27T23:59:59Z"),
     status: "draft",
     creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
     createdAt: new Date("2024-01-15T16:00:00Z"),
     updatedAt: new Date("2024-01-15T16:00:00Z"),
   },
 ];
 
 // topicId -> Set<voter>
 const allowlists = new Map<string, Set<string>>();
 
 // topicId -> (voter -> VoteRecord)
 const voteRegistry = new Map<string, Map<string, VoteRecord>>();
 
 export function getTopics() {
   return topics;
 }
 
 export function addTopic(newTopic: Topic) {
   topics.push(newTopic);
 }
 
 export function getTopicById(id: string) {
   return topics.find((t) => t.id === id);
 }
 
 export function addAllowedVoters(topicId: string, voters: string[]) {
   const set = allowlists.get(topicId) ?? new Set<string>();
   voters.forEach((v) => set.add(v.toLowerCase()));
   allowlists.set(topicId, set);
 }
 
 export function isEligible(topicId: string, voter: string) {
   const set = allowlists.get(topicId);
   if (!set || set.size === 0) return true; // open vote when no allowlist
   return set.has(voter.toLowerCase());
 }
 
 export function hasVoted(topicId: string, voter: string) {
   const reg = voteRegistry.get(topicId);
   if (!reg) return false;
   return reg.has(voter.toLowerCase());
 }
 
 function sha256Hex(data: string) {
   return crypto.createHash("sha256").update(data).digest("hex");
 }
 
 function makeReceiptId(topicId: string, voter: string, type: "up" | "down", timestamp: string) {
   return sha256Hex(`${topicId}|${voter.toLowerCase()}|${type}|${timestamp}`);
 }
 
 export function recordVote(topicId: string, voter: string, type: "up" | "down"): VoteRecord {
   const ts = new Date().toISOString();
   const receiptId = makeReceiptId(topicId, voter, type, ts);
   const rec: VoteRecord = { voter: voter.toLowerCase(), type, timestamp: ts, receiptId };
 
   const reg = voteRegistry.get(topicId) ?? new Map<string, VoteRecord>();
   reg.set(voter.toLowerCase(), rec);
   voteRegistry.set(topicId, reg);
 
   const topic = getTopicById(topicId);
   if (topic) {
     if (type === "up") topic.upvotes += 1;
     else topic.downvotes += 1;
     topic.updatedAt = new Date();
   }
 
   return rec;
 }
 
 export function getSnapshot(topicId: string) {
   const reg = voteRegistry.get(topicId);
   const values = reg ? Array.from(reg.values()) : [];
   // Deterministic order by voter
   values.sort((a, b) => a.voter.localeCompare(b.voter));
   const leaves = values.map((v) => sha256Hex(`${topicId}|${v.voter}|${v.type}|${v.timestamp}`));
 
   // Merkle root over leaves
   let level = leaves.slice();
   if (level.length === 0) {
     return { leaves, root: "" };
   }
   while (level.length > 1) {
     const next: string[] = [];
     for (let i = 0; i < level.length; i += 2) {
       if (i + 1 < level.length) {
         next.push(sha256Hex(level[i] + level[i + 1]));
       } else {
         // carry last node up
         next.push(level[i]);
       }
     }
     level = next;
   }
   return { leaves, root: level[0] };
 }
