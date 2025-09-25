import { NextResponse } from "next/server";

// Temporary in-memory list for demo
const topics = [
  { id: "1", title: "Welcome to VoteChain", upvotes: 10, downvotes: 1 },
  { id: "2", title: "Should we add dark mode?", upvotes: 7, downvotes: 2 },
];

export async function GET() {
  return NextResponse.json(topics);
}