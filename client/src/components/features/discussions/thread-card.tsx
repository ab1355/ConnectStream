import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ThreadCardProps {
  thread: {
    id: number;
    title: string;
    author: string;
    category: string;
    replies: number;
    views: number;
    lastActivity: string;
  };
}

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{thread.title}</h3>
            <p className="text-sm text-muted-foreground">
              Posted by @{thread.author}
            </p>
          </div>
          <Badge variant="secondary">{thread.category}</Badge>
        </div>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            {thread.replies} replies
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {thread.views} views
          </div>
          <div>
            Last activity {formatDistanceToNow(new Date(thread.lastActivity), { addSuffix: true })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
