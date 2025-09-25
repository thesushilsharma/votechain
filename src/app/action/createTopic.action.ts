"use server";

import { revalidatePath, revalidateTag } from "next/cache";
// import your persistence or blockchain SDK here

export async function createTopicAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  // Persist to DB or write to chain here
  // await db.topic.create({ data: { title } });
  // or await writeContract(...)

  // Revalidate RSC caches (if your server fetches use tags or paths)
  revalidatePath("/"); // or revalidateTag("topics");
}

export async function voteAction(input: { topicId: string; type: "up" | "down" }) {
  // perform mutation
  // await db.vote(...)
  revalidatePath("/");
}