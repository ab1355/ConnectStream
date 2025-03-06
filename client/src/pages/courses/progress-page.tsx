import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProgressTracker } from "@/components/features/courses/progress-tracker";
import { CourseCard } from "@/components/features/courses/course-card";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function CourseProgressPage() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Course Progress</h1>
              <ProgressTracker />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !courses?.length ? (
              <p className="text-center text-muted-foreground py-8">
                No courses found. Start learning by enrolling in a course!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
