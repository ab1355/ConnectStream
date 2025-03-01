import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MentionsInput } from "@/components/ui/mentions-input";
import { Input } from "@/components/ui/input";

export function CreatePostForm() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
      spaceId: 1 // TODO: Get from current space context
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))}>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Post title"
            {...form.register("title")}
          />
          <MentionsInput
            value={form.watch("content")}
            onChange={(value) => form.setValue("content", value)}
            placeholder="What's on your mind? Use @ to mention users and # for hashtags"
            className="w-full min-h-[100px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={createPostMutation.isPending}
          >
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
