import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between bg-background">
      <div className="font-semibold text-lg">Community Platform</div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarFallback>
              {user?.displayName?.[0] || user?.username?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline-block">
            {user?.displayName || user?.username}
          </span>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}