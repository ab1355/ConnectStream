import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, Users, MessageSquare, Trophy, BookOpen, Layout, MessageCircle, Shield, Bookmark, Link2, Mail, Palette, UsersIcon } from "lucide-react";
import { CustomLinks } from "./custom-links";
import { CustomLinksDialog } from "@/components/features/settings/custom-links-dialog";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: Home, label: "Feed", href: "/" },
  { icon: Users, label: "Members", href: "/members" },
  { icon: Layout, label: "Spaces", href: "/spaces" },
  { icon: MessageSquare, label: "Discussions", href: "/discussions" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: BookOpen, label: "Courses", href: "/courses" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { icon: Link2, label: "Custom URL", href: "/custom-slug" },
  { icon: Mail, label: "Email Settings", href: "/settings/email" },
  { icon: Palette, label: "Theme Settings", href: "/settings/theme" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

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

        {user && (user.role === "admin" || user.role === "moderator") && (
          <>
            <div className="pt-4">
              <h4 className="px-2 text-sm font-bold text-primary">Admin Dashboard</h4>
            </div>
            <Link href="/admin/user-approvals">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground",
                  location === "/admin/user-approvals" && "bg-accent text-foreground"
                )}
              >
                <Shield className="mr-2 h-4 w-4" />
                User Approvals
              </Button>
            </Link>
            {user.role === "admin" && (
              <>
                <Link href="/admin/role-management">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-muted-foreground hover:text-foreground",
                      location === "/admin/role-management" && "bg-accent text-foreground"
                    )}
                  >
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Role Management
                  </Button>
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Quick Links</h2>
          <CustomLinksDialog />
        </div>
        <CustomLinks />
      </div>
    </aside>
  );
}