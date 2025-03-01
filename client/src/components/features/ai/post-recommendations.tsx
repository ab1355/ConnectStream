
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";

type Recommendation = {
  id: number;
  title: string;
  score: number;
  reason: string;
};

export function PostRecommendations() {
  const [, navigate] = useLocation();
  
  const { data: recommendations, isLoading, error } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations/posts'],
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Loading personalized recommendations...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (error || !recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Interact more with the platform to get personalized recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Posts we think you might be interested in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((rec) => (
          <div key={rec.id} className="border rounded-md p-3 hover:bg-accent transition-colors">
            <h3 className="font-medium">{rec.title}</h3>
            <p className="text-sm text-muted-foreground">{rec.reason}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/discover')}
        >
          See more recommendations
        </Button>
      </CardFooter>
    </Card>
  );
}
