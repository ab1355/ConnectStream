import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Compass } from "lucide-react";

export function LearningPathGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      difficulty: string;
    }) => {
      const response = await fetch("/api/learning-paths/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to generate learning path");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      toast({
        title: "Learning Path Generated",
        description: "Your personalized learning path has been created",
      });
      setTitle("");
      setDescription("");
      setDifficulty("");
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
    if (!title || !description || !difficulty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ title, description, difficulty });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5" />
          Learning Path Generator
        </CardTitle>
        <CardDescription>
          Generate a personalized learning path based on your interests and goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Learning Path Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={generateMutation.isPending}
            />
          </div>
          <div>
            <Textarea
              placeholder="Describe your learning goals and interests"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={generateMutation.isPending}
              rows={4}
            />
          </div>
          <div>
            <Select
              value={difficulty}
              onValueChange={setDifficulty}
              disabled={generateMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
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
                <Compass className="mr-2 h-4 w-4" />
                Generate Learning Path
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
