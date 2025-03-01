import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, Users, MessageSquare, Trophy, BookOpen, Layout } from "lucide-react";

const navItems = [
  { icon: Home, label: "Feed", href: "/" },
  { icon: Users, label: "Members", href: "/members" },
  { icon: Layout, label: "Spaces", href: "/spaces" },
  { icon: MessageSquare, label: "Discussions", href: "/discussions" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: BookOpen, label: "Courses", href: "/courses" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r h-[calc(100vh-3.5rem)] p-4 hidden md:block bg-background">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground",
                location === item.href && "bg-accent text-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
}