import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { RoleVisibility } from "@/components/features/admin/role-visibility";
import { AICourseBuilder } from "@/components/features/admin/ai-course-builder";
import { CourseImporter } from "@/components/features/courses/course-importer";
import { FeatureAccessManager } from "@/components/features/admin/feature-access-manager";
import { SpaceBrandingManager } from "@/components/features/admin/space-branding-manager";

export default function CourseManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Only allow admin access
  if (user?.role !== "admin") {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You need administrator privileges to access this page.
        </p>
      </div>
    );
  }

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["/api/admin/course-enrollments"],
  });

  if (loadingEnrollments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrollments?.totalEnrollments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrollments?.activeCourses || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrollments?.averageCompletionRate || 0}%</p>
            <Progress
              value={enrollments?.averageCompletionRate || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Feature Access Control</h2>
          <FeatureAccessManager />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Space Branding</h2>
          <SpaceBrandingManager />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Import</h2>
            <CourseImporter />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Course Generation</h2>
            <AICourseBuilder />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Role Management</h2>
          <RoleVisibility />
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Student Enrollments</CardTitle>
            <CardDescription>
              Manage and monitor student progress across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Implement DataTable with enrollment data */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}