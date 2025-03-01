import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { UserBadge } from "@/components/features/badges/user-badge";

interface MemberCardProps {
  username: string;
  displayName: string;
  role: string;
  status: string;
  points: number;
  avatarUrl?: string;
}

export function MemberCard({ username, displayName, role, status, points, avatarUrl }: MemberCardProps) {
  // Query user achievements
  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements", username],
    queryFn: async () => {
      const res = await fetch(`/api/achievements/${username}`);
      return res.json();
    },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="w-20 h-20 mx-auto">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : (
            <AvatarFallback className="text-2xl">
              {displayName[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <h3 className="font-semibold text-lg mt-2">{displayName}</h3>
        <p className="text-sm text-muted-foreground">@{username}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant={role === "admin" ? "destructive" : "secondary"}>
            {role}
          </Badge>
          <Badge variant={status === "active" ? "default" : "outline"}>
            {status}
          </Badge>
        </div>
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Trophy className="h-4 w-4 mr-1" />
          {points} points
        </div>
        {achievements && achievements.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-center">Badges</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {achievements.map((achievement) => (
                <UserBadge 
                  key={achievement.id} 
                  achievement={achievement}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
      </CardFooter>
    </Card>
  );
}