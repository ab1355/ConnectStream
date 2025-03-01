import { Progress } from "@/components/ui/progress";

export function ProgressTracker() {
  // This would typically come from an API
  const progress = {
    completedCourses: 3,
    totalCourses: 12,
    progressPercentage: 25
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{progress.completedCourses}</span>
        {" / "}
        <span>{progress.totalCourses}</span>
        {" courses completed"}
      </div>
      <Progress value={progress.progressPercentage} className="w-[100px]" />
    </div>
  );
}
