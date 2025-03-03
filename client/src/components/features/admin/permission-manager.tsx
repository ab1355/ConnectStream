import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isEnabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const defaultPermissions: Permission[] = [
  {
    id: "spaces_create",
    name: "Create Spaces",
    description: "Ability to create new spaces",
    category: "Spaces",
    isEnabled: true
  },
  {
    id: "spaces_delete",
    name: "Delete Spaces",
    description: "Ability to delete spaces",
    category: "Spaces",
    isEnabled: false
  },
  {
    id: "courses_create",
    name: "Create Courses",
    description: "Ability to create new courses",
    category: "Courses",
    isEnabled: true
  },
  {
    id: "courses_publish",
    name: "Publish Courses",
    description: "Ability to publish courses",
    category: "Courses",
    isEnabled: false
  },
  {
    id: "users_moderate",
    name: "Moderate Users",
    description: "Ability to moderate user content",
    category: "Users",
    isEnabled: false
  },
  {
    id: "roles_manage",
    name: "Manage Roles",
    description: "Ability to manage roles and permissions",
    category: "Administration",
    isEnabled: false
  }
];

export function PermissionManager() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>();
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  
  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
  });

  const { data: permissions = defaultPermissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/admin/permissions", selectedRole],
    enabled: !!selectedRole
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setNewRoleName("");
      setNewRoleDescription("");
      toast({
        title: "Role created",
        description: "The new role has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: Permission[]) => {
      const res = await fetch(`/api/admin/roles/${selectedRole}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: permissions.filter(p => p.isEnabled).map(p => p.id) })
      });
      if (!res.ok) throw new Error("Failed to update permissions");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/permissions", selectedRole] });
      toast({
        title: "Permissions updated",
        description: "Role permissions have been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }
    createRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDescription
    });
  };

  const handlePermissionToggle = (permissionId: string, enabled: boolean) => {
    const updatedPermissions = permissions.map(p =>
      p.id === permissionId ? { ...p, isEnabled: enabled } : p
    );
    updatePermissionsMutation.mutate(updatedPermissions);
  };

  if (rolesLoading || permissionsLoading) {
    return <div>Loading permission settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Management</CardTitle>
        <CardDescription>
          Configure role-based permissions and access control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="flex gap-4 items-end mb-6">
              <div className="space-y-2 flex-1">
                <Label>Role Name</Label>
                <Input
                  placeholder="Enter role name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Description</Label>
                <Input
                  placeholder="Enter role description"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateRole}>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{role.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRole(role.id)}
                    >
                      Configure
                    </Button>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {Object.entries(
                  permissions.reduce((acc, curr) => {
                    acc[curr.category] = acc[curr.category] || [];
                    acc[curr.category].push(curr);
                    return acc;
                  }, {} as Record<string, Permission[]>)
                ).map(([category, perms]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="font-semibold text-lg">{category}</h3>
                    <div className="space-y-4">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <Label>{permission.name}</Label>
                            <div className="text-sm text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <Switch
                            checked={permission.isEnabled}
                            onCheckedChange={(checked) =>
                              handlePermissionToggle(permission.id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
