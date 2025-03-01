import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageListProps {
  onSelectUser: (user: User) => void;
}

export function MessageList({ onSelectUser }: MessageListProps) {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[600px] rounded-lg border bg-card">
      <div className="p-4 space-y-2">
        {users?.map((user) => (
          <Button
            key={user.id}
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
            onClick={() => onSelectUser(user)}
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {user.displayName?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">{user.displayName || user.username}</div>
                <div className="text-sm text-muted-foreground">Click to chat</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
