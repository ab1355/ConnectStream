import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { UniversalSearch } from "@/components/features/search/universal-search";
import { NotificationDropdown } from "@/components/features/notifications/notification-dropdown";

export function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between bg-background">
      <div className="font-semibold text-lg">Community Platform</div>

      <div className="flex-1 px-4 md:px-8">
        <UniversalSearch />
      </div>

      <div className="flex items-center space-x-4">
        <NotificationDropdown />

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