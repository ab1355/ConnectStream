import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  enrolledCount: number;
  progress?: number;
  imageUrl: string;
}

export function CourseCard({
  title,
  description,
  category,
  level,
  duration,
  enrolledCount,
  progress,
  imageUrl
}: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge>{category}</Badge>
          <Badge variant="outline">{level}</Badge>
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {duration}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {enrolledCount} enrolled
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
          {progress !== undefined ? "Continue Learning" : "Enroll Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
