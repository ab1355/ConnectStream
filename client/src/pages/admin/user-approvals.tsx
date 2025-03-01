import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";

export default function UserApprovalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/pending"] });
      toast({
        title: "User approved",
        description: "The user has been approved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/block`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/pending"] });
      toast({
        title: "User blocked",
        description: "The user has been blocked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6" />
              <h1 className="text-2xl font-bold">User Approvals</h1>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : pendingUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No pending users to approve
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingUsers?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.displayName}</TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "PPp")}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => approveMutation.mutate(user.id)}
                              disabled={approveMutation.isPending}
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => blockMutation.mutate(user.id)}
                              disabled={blockMutation.isPending}
                            >
                              <ShieldX className="h-4 w-4 mr-1" />
                              Block
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
