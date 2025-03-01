import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
          <div>
            <Input 
              placeholder="Post title"
              {...form.register("title")}
            />
          </div>
          <div>
            <Textarea 
              placeholder="What's on your mind?"
              className="min-h-[100px]"
              {...form.register("content")}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={createPostMutation.isPending}>
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
