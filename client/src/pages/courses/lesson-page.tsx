import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { LessonDiscussion } from "@/components/features/courses/lesson-discussion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["/api/lessons", lessonId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {lesson.content}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <LessonDiscussion lessonId={parseInt(lessonId)} />
      </div>
    </div>
  );
}
