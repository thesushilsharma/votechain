 import { NextResponse } from "next/server";
 import { getSnapshot, getTopicById } from "@/lib/topicsStore";
 
 export async function GET(
   _request: Request,
   { params }: { params: Promise<{ id: string }> },
 ) {
   try {
     const { id: topicId } = await params;
     const topic = getTopicById(topicId);
     if (!topic) {
       return NextResponse.json({ error: "Topic not found" }, { status: 404 });
     }
     const snapshot = getSnapshot(topicId);
     return NextResponse.json(snapshot);
   } catch (error) {
     return NextResponse.json(
       { error: "Failed to create snapshot" },
       { status: 500 },
     );
   }
 }
