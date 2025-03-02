import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  progress?: number;
}

export function CourseCard({ course, progress }: CourseCardProps) {
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
        {progress !== undefined && (
          <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-right">{progress}% complete</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          {progress !== undefined ? "Continue Learning" : "View Course"}
        </Button>
      </CardFooter>
    </Card>
  );
}