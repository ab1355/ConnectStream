import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export function AICourseBuilder() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: { topic: string; description: string }) => {
      const response = await fetch("/api/admin/courses/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to generate course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course Generated",
        description: "AI has successfully generated a new course structure",
      });
      setTopic("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ topic, description });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Course Generator
        </CardTitle>
        <CardDescription>
          Generate course content and structure using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Course Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generateMutation.isPending}
            />
          </div>
          <div>
            <Textarea
              placeholder="Course Description and Goals"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={generateMutation.isPending}
              rows={4}
            />
          </div>
          <Button 
            type="submit" 
            disabled={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Course
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
