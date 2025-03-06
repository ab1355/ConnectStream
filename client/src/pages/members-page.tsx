import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MemberGrid } from "@/components/features/members/member-grid";
import { MemberSearch } from "@/components/features/members/member-search";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const { data: members = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchQuery
      ? member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.displayName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      : true;

    const matchesRole = roleFilter === "all" ? true : member.role === roleFilter;

    const matchesStatus = statusFilter === "all" 
      ? true 
      : statusFilter === "active" 
        ? member.isActive 
        : !member.isActive;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Members</h1>
            <MemberSearch 
              onSearchChange={setSearchQuery}
              onRoleFilter={setRoleFilter}
              onStatusFilter={setStatusFilter}
            />
            <MemberGrid members={filteredMembers} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}