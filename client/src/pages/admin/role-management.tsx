import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RoleVisibility } from "@/components/features/admin/role-visibility";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function RoleManagementPage() {
  const { user } = useAuth();

  // Only allow admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Role Management</h1>
            <RoleVisibility />
          </div>
        </main>
      </div>
    </div>
  );
}
