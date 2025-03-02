import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CourseGrid } from "@/components/features/courses/course-grid";
import { CourseFilter } from "@/components/features/courses/course-filter";
import { ProgressTracker } from "@/components/features/courses/progress-tracker";
import { LearningPathGenerator } from "@/components/features/courses/learning-path-generator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";

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
              <div className="flex items-center gap-4">
                <ProgressTracker />
                <Link href="/courses/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Learning Path</h2>
                <LearningPathGenerator />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Course Filter</h2>
                <CourseFilter />
              </div>
            </div>

            <CourseGrid />
          </div>
        </main>
      </div>
    </div>
  );
}