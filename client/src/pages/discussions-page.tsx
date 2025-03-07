import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ThreadList } from "@/components/features/discussions/thread-list";
import { CategoryNavigation } from "@/components/features/discussions/category-navigation";
import { SearchDiscussions } from "@/components/features/discussions/search-discussions";
import { CreateThreadDialog } from "@/components/features/threads/create-thread-dialog";
import { TourProvider } from "@/components/features/onboarding/tour-provider";
import type { TourStep } from "@/hooks/use-tour";

const discussionsTourSteps: TourStep[] = [
  {
    id: "discussions-intro",
    title: "Welcome to Discussions",
    content: "This is where you can find and participate in community discussions.",
    targetId: "discussions-header",
    placement: "bottom",
  },
  {
    id: "create-thread",
    title: "Create New Threads",
    content: "Click here to start a new discussion thread with the community.",
    targetId: "create-thread-button",
    placement: "left",
  },
  {
    id: "categories",
    title: "Browse Categories",
    content: "Filter discussions by category to find topics that interest you.",
    targetId: "category-nav",
    placement: "right",
  },
];

export default function DiscussionsPage() {
  return (
    <TourProvider tourId="discussions-tour" steps={discussionsTourSteps}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6" id="discussions-header">
                <h1 className="text-2xl font-bold">Discussions</h1>
                <div id="create-thread-button">
                  <CreateThreadDialog />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div id="category-nav" className="lg:col-span-1">
                  <CategoryNavigation />
                </div>
                <div className="lg:col-span-3 space-y-6">
                  <SearchDiscussions />
                  <ThreadList />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </TourProvider>
  );
}