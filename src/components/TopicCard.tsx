"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/types/topic";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useState } from "react";

interface TopicCardProps {
  topic: Topic;
  onVote: (topicId: string, type: "up" | "down") => void;
  onComment: (topicId: string) => void;
  onSnapshot: (topicId: string) => void;
  snapshotRoot?: string;
  lastReceipt?: string;
  snapshotCount?: number;
  detailsOpen: boolean;
  onToggleDetails: () => void;
}

export function TopicCard({ topic, onVote, onComment, onSnapshot, snapshotRoot, lastReceipt, snapshotCount, detailsOpen, onToggleDetails }: TopicCardProps) {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [allowInput, setAllowInput] = useState("");
  const [allowMsg, setAllowMsg] = useState("");
  const [allowList, setAllowList] = useState<string[]>([]);

  const getStatusIcon = () => {
    switch (topic.status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ended":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (topic.startTime && topic.endTime) {
      const now = new Date();
      const startTime = new Date(topic.startTime);
      const endTime = new Date(topic.endTime);

      if (now < startTime) {
        return `Starts ${startTime.toLocaleDateString()}`;
      }
      if (now > endTime) {
        return `Ended ${endTime.toLocaleDateString()}`;
      }
      return `Ends ${endTime.toLocaleDateString()}`;
    }
    return topic.status.charAt(0).toUpperCase() + topic.status.slice(1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{topic.title}</CardTitle>
            {topic.description && (
              <CardDescription className="mt-2">
                {topic.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getStatusIcon()}
            {getStatusText()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVote(topic.id, "up")}
                disabled={!isSignedIn || topic.status !== "active"}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {topic.upvotes}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVote(topic.id, "down")}
                disabled={!isSignedIn || topic.status !== "active"}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                {topic.downvotes}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(topic.id)}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              {topic.comments.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSnapshot(topic.id)}
              className="flex items-center gap-1"
            >
              Snapshot
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetails}
              className="flex items-center gap-1"
            >
              Details
            </Button>
          </div>
          {detailsOpen && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                {lastReceipt && (
                  <div className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-2">
                    <span>Receipt:</span>
                    <code>{lastReceipt.slice(0, 10)}...</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(lastReceipt)}
                      className="underline"
                    >
                      Copy
                    </button>
                  </div>
                )}
                {snapshotRoot && (
                  <div className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-2">
                    <span>Root:</span>
                    <code>{snapshotRoot.slice(0, 10)}...</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(snapshotRoot)}
                      className="underline"
                    >
                      Copy
                    </button>
                    {typeof snapshotCount === "number" && (
                      <span>Leaves: {snapshotCount}</span>
                    )}
                  </div>
                )}
              </div>
              {isSignedIn &&
                evmAddress &&
                evmAddress.toLowerCase() === topic.creator.toLowerCase() && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add voter address"
                        value={allowInput}
                        onChange={(e) => setAllowInput(e.target.value)}
                        className="flex w-64 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            setAllowMsg("");
                            const res = await fetch(`/api/topics/${topic.id}/allowlist`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ allow: [allowInput] }),
                            });
                            if (!res.ok) {
                              const j = await res.json().catch(() => ({}));
                              throw new Error(j?.error ?? "Failed to add voter");
                            }
                            setAllowMsg("Added");
                            setAllowInput("");
                            setTimeout(() => setAllowMsg(""), 2000);
                          } catch (e) {
                            setAllowMsg((e as Error)?.message ?? "Error");
                            setTimeout(() => setAllowMsg(""), 3000);
                          }
                        }}
                      >
                        Add
                      </Button>
                      {allowMsg && <span className="text-xs text-muted-foreground">{allowMsg}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/topics/${topic.id}/allowlist`);
                            if (!res.ok) throw new Error("Failed to fetch allowlist");
                            const data = await res.json();
                            setAllowList(Array.isArray(data?.allow) ? data.allow : []);
                          } catch (e) {
                            setAllowMsg((e as Error)?.message ?? "Error");
                            setTimeout(() => setAllowMsg(""), 3000);
                          }
                        }}
                      >
                        Refresh allowlist
                      </Button>
                      {allowList.length > 0 && (
                        <span className="text-xs text-muted-foreground">Count: {allowList.length}</span>
                      )}
                    </div>
                    {allowList.length > 0 && (
                      <div className="text-xs bg-muted rounded px-3 py-2 max-h-24 overflow-auto">
                        <ul className="space-y-1">
                          {allowList.map((addr) => (
                            <li key={addr} className="flex items-center gap-2">
                              <code>{addr.slice(0, 10)}...</code>
                              <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(addr)}
                                className="underline"
                              >
                                Copy
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            by {topic.creator.slice(0, 6)}...{topic.creator.slice(-4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
