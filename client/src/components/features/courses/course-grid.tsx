import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "./course-card";
import { Course } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function CourseGrid() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <LoadingScreen 
        variant="inline" 
        message="Loading courses..." 
      />
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