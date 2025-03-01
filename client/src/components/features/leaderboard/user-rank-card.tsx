import { Trophy, Medal, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserRankCardProps {
  rank: number;
  username: string;
  displayName?: string;
  points: number;
  level: number;
  avatarUrl?: string;
}

export function UserRankCard({ rank, username, displayName, points, level, avatarUrl }: UserRankCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex items-center justify-center w-8">
          {getRankIcon(rank)}
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {displayName?.[0] || username[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{displayName || username}</p>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">Level {level}</Badge>
          <p className="text-sm font-medium">{points} points</p>
        </div>
      </CardContent>
    </Card>
  );
}
