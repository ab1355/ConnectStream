import { CourseEditor } from "@/components/features/courses/course-editor";

export default function CreateCoursePage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
      <CourseEditor />
    </div>
  );
}
