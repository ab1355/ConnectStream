import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function CreatePost() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: ""
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      toast({
        title: "Success",
        description: "Your post has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Create a Post</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              placeholder="Give your post a title"
              {...form.register("title")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content"
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none"
              {...form.register("content")}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={createPostMutation.isPending}
            >
              Create Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}