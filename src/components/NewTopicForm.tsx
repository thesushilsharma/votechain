"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createTopicAction } from "@/app/action/createTopic.action";
import { queryKeys } from "@/lib/queries";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type FormState = { ok: boolean; error?: string | null };

export default function NewTopicForm() {
  const qc = useQueryClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  // Optimistic feedback: show the last title being added
  const [optimistic, addOptimistic] = useOptimistic<string | null, string>(
    null,
    (_current, newTitle) => newTitle
  );

  const [state, formAction, isSubmitting] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const t = String(formData.get("title") ?? "").trim();
      if (!t) {
        return { ok: false, error: "Title is required" };
      }

      await createTopicAction(formData);

      // Invalidate client cache and optionally refresh RSC tree
      await qc.invalidateQueries({ queryKey: queryKeys.topics });
      startTransition(() => router.refresh());

      // Clear input on success
      setTitle("");

      return { ok: true, error: null };
    },
    { ok: false, error: null }
  );

  return (
    <div className="space-y-2">
      <form
        className="flex gap-2"
        action={formAction}
        onSubmit={(e) => {
          // add optimistic feedback without blocking submission
          const fd = new FormData(e.currentTarget);
          const t = String(fd.get("title") ?? "").trim();
          if (t) addOptimistic(t);
        }}
      >
        <input
          name="title"
          className="border rounded px-3 py-2 flex-1"
          placeholder="New topic title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isSubmitting || isPending}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </form>

      {optimistic && (
        <p className="text-sm text-gray-500">Adding “{optimistic}”…</p>
      )}
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}