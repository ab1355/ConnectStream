import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import type { Course } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { data: progress } = useQuery({
    queryKey: ["/api/courses", course.id, "progress"],
    enabled: !!course.id,
  });

  // Navigate to the first lesson of the course
  const lessonUrl = `/courses/${course.id}/lessons/1`;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={course.coverImage || 'https://via.placeholder.com/800x400?text=No+Cover+Image'} 
          alt={course.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{course.published ? 'Published' : 'Draft'}</Badge>
          {progress?.percentageComplete === 100 && (
            <Badge variant="success">Completed</Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg">{course.title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {course.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Created {new Date(course.createdAt).toLocaleDateString()}
          </div>
        </div>
        {progress && (
          <div className="space-y-1">
            <Progress value={progress.percentageComplete} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.completedLessons} / {progress.totalLessons} lessons</span>
              <span>{progress.percentageComplete}% complete</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={lessonUrl}>
            {progress ? "Continue Learning" : "Start Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}