import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ThreadList } from "@/components/features/discussions/thread-list";
import { CategoryNavigation } from "@/components/features/discussions/category-navigation";
import { SearchDiscussions } from "@/components/features/discussions/search-discussions";
import { CreateThreadDialog } from "@/components/features/threads/create-thread-dialog";

export default function DiscussionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Discussions</h1>
              <CreateThreadDialog />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <CategoryNavigation className="lg:col-span-1" />
              <div className="lg:col-span-3 space-y-6">
                <SearchDiscussions />
                <ThreadList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}