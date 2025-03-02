import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LessonDiscussion, InsertLessonDiscussion, LessonDiscussionReply } from "@shared/schema";
import { insertLessonDiscussionSchema } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Pin } from "lucide-react";

interface LessonDiscussionProps {
  lessonId: number;
}

export function LessonDiscussion({ lessonId }: LessonDiscussionProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const { data: discussions, isLoading } = useQuery<LessonDiscussion[]>({
    queryKey: ["/api/lessons", lessonId, "discussions"],
  });

  const form = useForm<InsertLessonDiscussion>({
    resolver: zodResolver(insertLessonDiscussionSchema),
    defaultValues: {
      lessonId,
      title: "",
      content: "",
      isPinned: false,
    },
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (data: InsertLessonDiscussion) => {
      const res = await apiRequest("POST", `/api/lessons/${lessonId}/discussions`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons", lessonId, "discussions"] });
      setIsCreating(false);
      form.reset();
      toast({
        title: "Discussion created",
        description: "Your discussion has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create discussion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lesson Discussions</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : "Start Discussion"}
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createDiscussionMutation.mutate(data))}>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discussion Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter discussion title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What would you like to discuss?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={createDiscussionMutation.isPending}
                >
                  {createDiscussionMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Post Discussion
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      <div className="space-y-4">
        {discussions?.map((discussion) => (
          <Card key={discussion.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatar.vercel.sh/${discussion.authorId}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{discussion.title}</h3>
                  {discussion.isPinned && (
                    <Pin className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Posted on {new Date(discussion.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{discussion.content}</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Reply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
