import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CourseGrid } from "@/components/features/courses/course-grid";
import { CourseFilter } from "@/components/features/courses/course-filter";
import { ProgressTracker } from "@/components/features/courses/progress-tracker";

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Courses</h1>
              <ProgressTracker />
            </div>
            <CourseFilter />
            <CourseGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
