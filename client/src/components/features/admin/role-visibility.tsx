import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";

interface RolePermission {
  name: string;
  description: string;
  routes: string[];
}

const rolePermissions: Record<string, RolePermission> = {
  admin: {
    name: "Administrator",
    description: "Full system access with all management capabilities",
    routes: [
      "/admin/*",
      "/api/admin/*",
      "User Management",
      "Course Management",
      "Content Moderation",
      "System Settings"
    ]
  },
  moderator: {
    name: "Moderator",
    description: "Content moderation and user management capabilities",
    routes: [
      "/admin/user-approvals",
      "/api/admin/user-approvals",
      "User Approvals",
      "Content Moderation"
    ]
  },
  user: {
    name: "User",
    description: "Standard user access to platform features",
    routes: [
      "Course Access",
      "Community Participation",
      "Profile Management"
    ]
  }
};

interface RoleStats {
  distribution: Array<{
    role: string;
    count: number;
  }>;
  pendingApprovals: number;
}

export function RoleVisibility() {
  const { data: roleStats, isLoading } = useQuery<RoleStats>({
    queryKey: ["/api/admin/role-stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleStats?.distribution.map((stat) => (
              <div key={stat.role} className="flex items-center gap-2">
                <Badge variant={stat.role === 'admin' ? 'destructive' : stat.role === 'moderator' ? 'warning' : 'secondary'}>
                  {stat.count}
                </Badge>
                <span className="text-sm font-medium">{rolePermissions[stat.role]?.name || stat.role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Role Permissions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {Object.entries(rolePermissions).map(([role, permission]) => (
                <div key={role} className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {permission.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {permission.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {permission.routes.map((route) => (
                      <Badge key={route} variant="outline" className="justify-start">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}