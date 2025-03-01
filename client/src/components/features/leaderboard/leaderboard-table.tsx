import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

// Sample data - this would typically come from an API
const leaderboardData = [
  {
    rank: 1,
    username: "johndoe",
    displayName: "John Doe",
    points: 1250,
    achievements: 15,
  },
  {
    rank: 2,
    username: "janedoe",
    displayName: "Jane Doe",
    points: 1100,
    achievements: 12,
  },
  {
    rank: 3,
    username: "bobsmith",
    displayName: "Bob Smith",
    points: 950,
    achievements: 10,
  },
];

export function LeaderboardTable() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Points</TableHead>
            <TableHead className="text-right">Achievements</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.map((user) => (
            <TableRow key={user.username}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {user.rank === 1 && (
                    <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                  )}
                  #{user.rank}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell className="text-right">{user.achievements}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
