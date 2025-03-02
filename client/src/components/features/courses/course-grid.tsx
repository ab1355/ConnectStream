import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "./course-card";
import { Course } from "@shared/schema";
import { Loader2 } from "lucide-react";

export function CourseGrid() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No courses found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}