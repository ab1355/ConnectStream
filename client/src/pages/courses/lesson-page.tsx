import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LessonDiscussion } from "@/components/features/courses/lesson-discussion";

interface Lesson {
  id: number;
  title: string;
  content: string;
  courseId: number;
  sectionId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", lessonId],
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
              <p className="text-muted-foreground">The requested lesson could not be found.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
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
              <LessonDiscussion lessonId={parseInt(lessonId, 10)} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}