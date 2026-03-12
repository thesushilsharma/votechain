import { NextResponse } from "next/server";
import { addAllowedVoters, getTopicById, getAllowedVoters } from "@/lib/topicsStore";
 
 export async function POST(
   request: Request,
   { params }: { params: Promise<{ id: string }> },
 ) {
   try {
     const { id: topicId } = await params;
     const topic = getTopicById(topicId);
     if (!topic) {
       return NextResponse.json({ error: "Topic not found" }, { status: 404 });
     }
     const body = await request.json();
     const allow: string[] = Array.isArray(body?.allow) ? body.allow : [];
     if (allow.length === 0) {
       return NextResponse.json({ error: "No voters provided" }, { status: 400 });
     }
     addAllowedVoters(topicId, allow);
     return NextResponse.json({ success: true, topicId, added: allow.length });
   } catch (error) {
     return NextResponse.json(
       { error: "Failed to update allowlist" },
       { status: 500 },
     );
   }
 }

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
    const allow = getAllowedVoters(topicId);
    return NextResponse.json({ allow });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch allowlist" }, { status: 500 });
  }
}
