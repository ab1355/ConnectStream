import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Bookmark } from "lucide-react";
import type { Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // Query to check if the post is bookmarked
  const { data: bookmarks } = useQuery<Array<{ postId: number }>>({
    queryKey: ["/api/bookmarks"],
  });

  const isBookmarked = bookmarks?.some(b => b.postId === post.id);

  // Mutations for bookmark actions
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/bookmarks/${post.id}`);
      } else {
        await apiRequest("POST", "/api/bookmarks", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex-row gap-4 items-center">
        <Avatar>
          <AvatarFallback>
            {post.authorId.toString()[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="gap-4">
        <Button variant="ghost" size="sm">
          <Heart className="h-4 w-4 mr-2" />
          Like
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Comment
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => bookmarkMutation.mutate()}
          disabled={bookmarkMutation.isPending}
        >
          <Bookmark 
            className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} 
          />
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </CardFooter>
    </Card>
  );
}