import { NextResponse } from "next/server";
import { addAllowedVoters, getAllowedVoters, getTopicById } from "@/lib/topicsStore";
import { ok, err } from "@/lib/api";
import { validateAllowlist } from "@/lib/validation";
import { ipFromHeaders, rateLimit } from "@/lib/rateLimit";
 
 export async function POST(
   request: Request,
   { params }: { params: Promise<{ id: string }> },
 ) {
   try {
     const { id: topicId } = await params;
     const topic = getTopicById(topicId);
     if (!topic) {
      return NextResponse.json(err("NOT_FOUND", "Topic not found"), { status: 404 });
     }
    const rl = rateLimit(`${ipFromHeaders(request.headers)}:allowlist`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(err("RATE_LIMITED", "Too many requests"), { status: 429 });
    }
    const body = await request.json();
    const v = validateAllowlist(body);
    if (!v.ok) {
      return NextResponse.json(err("BAD_REQUEST", v.message, v.details), { status: 400 });
     }
    addAllowedVoters(topicId, v.data.allow);
    return NextResponse.json(ok({ topicId, added: v.data.allow.length }));
   } catch (error) {
    return NextResponse.json(err("INTERNAL", "Failed to update allowlist"), { status: 500 });
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
      return NextResponse.json(err("NOT_FOUND", "Topic not found"), { status: 404 });
    }
    const allow = getAllowedVoters(topicId);
    return NextResponse.json(ok({ allow }));
  } catch (error) {
    return NextResponse.json(err("INTERNAL", "Failed to fetch allowlist"), { status: 500 });
  }
}
