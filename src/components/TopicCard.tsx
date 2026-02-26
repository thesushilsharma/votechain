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

interface TopicCardProps {
  topic: Topic;
  onVote: (topicId: string, type: "up" | "down") => void;
  onComment: (topicId: string) => void;
}

export function TopicCard({ topic, onVote, onComment }: TopicCardProps) {
  const { isSignedIn } = useIsSignedIn();

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
          </div>
          <div className="text-xs text-muted-foreground">
            by {topic.creator.slice(0, 6)}...{topic.creator.slice(-4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
