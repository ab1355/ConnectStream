import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SpaceGrid } from "@/components/features/spaces/space-grid";
import { SpaceFilter } from "@/components/features/spaces/space-filter";
import { CreateSpaceDialog } from "@/components/features/spaces/create-space-dialog";
import { CreatePollDialog } from "@/components/features/polls/create-poll-dialog";
import { CreateThreadDialog } from "@/components/features/threads/create-thread-dialog";

export default function SpacesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Spaces</h1>
              <div className="flex gap-2">
                <CreateThreadDialog />
                <CreatePollDialog />
                <CreateSpaceDialog />
              </div>
            </div>
            <SpaceFilter />
            <SpaceGrid />
          </div>
        </main>
      </div>
    </div>
  );
}