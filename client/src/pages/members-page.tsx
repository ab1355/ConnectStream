import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MemberGrid } from "@/components/features/members/member-grid";
import { MemberSearch } from "@/components/features/members/member-search";

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Members</h1>
            <MemberSearch />
            <MemberGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
