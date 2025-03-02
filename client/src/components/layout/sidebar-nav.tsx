import { NavLink } from "@/components/ui/nav-link";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  Users,
  MessageSquare,
  Layout,
  Settings,
  Shield,
  BookOpenCheck
} from "lucide-react";

export function SidebarNav() {
  const { user } = useAuth();

  return (
    <nav className="space-y-1">
      <NavLink href="/courses">
        <BookOpen className="h-4 w-4" />
        Courses
      </NavLink>
      <NavLink href="/members">
        <Users className="h-4 w-4" />
        Members
      </NavLink>
      <NavLink href="/messages">
        <MessageSquare className="h-4 w-4" />
        Messages
      </NavLink>
      <NavLink href="/spaces">
        <Layout className="h-4 w-4" />
        Spaces
      </NavLink>

      {/* Admin section */}
      {user?.role === "admin" && (
        <>
          <div className="pt-4">
            <h4 className="px-2 text-sm font-bold text-primary">Admin Dashboard</h4>
          </div>
          <NavLink href="/admin/user-approvals">
            <Shield className="h-4 w-4" />
            User Approvals
          </NavLink>
          <NavLink href="/admin/course-management" className="bg-accent/50">
            <BookOpenCheck className="h-4 w-4" />
            Course Management
          </NavLink>
        </>
      )}

      {/* Settings section */}
      <div className="pt-4">
        <h4 className="px-2 text-sm font-semibold text-muted-foreground">Settings</h4>
      </div>
      <NavLink href="/settings/email">
        <Settings className="h-4 w-4" />
        Email Settings
      </NavLink>
    </nav>
  );
}