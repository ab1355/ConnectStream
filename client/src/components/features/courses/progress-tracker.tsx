import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface ProgressTrackerProps {
  courseId?: number;
}

interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentageComplete: number;
}

interface OverallProgress {
  totalCourses: number;
  completedCourses: number;
  percentageComplete: number;
}

export function ProgressTracker({ courseId }: ProgressTrackerProps) {
  const { data: progress, isLoading } = useQuery<CourseProgress>({
    queryKey: ["/api/courses", courseId, "progress"],
    enabled: !!courseId,
  });

  const { data: overallProgress, isLoading: loadingOverall } = useQuery<OverallProgress>({
    queryKey: ["/api/user/courses/progress"],
    enabled: !courseId, // Only fetch overall progress when not viewing a specific course
  });

  if (isLoading || loadingOverall) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading progress...</span>
      </div>
    );
  }

  if (courseId && progress) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{progress.completedLessons}</span>
          {" / "}
          <span>{progress.totalLessons}</span>
          {" lessons completed"}
        </div>
        <Progress value={progress.percentageComplete} className="w-[100px]" />
      </div>
    );
  }

  if (overallProgress) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{overallProgress.completedCourses}</span>
          {" / "}
          <span>{overallProgress.totalCourses}</span>
          {" courses completed"}
        </div>
        <Progress value={overallProgress.percentageComplete} className="w-[100px]" />
      </div>
    );
  }

  return null;
}