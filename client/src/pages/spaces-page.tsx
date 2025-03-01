import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SpaceGrid } from "@/components/features/spaces/space-grid";
import { SpaceFilter } from "@/components/features/spaces/space-filter";

export default function SpacesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Spaces</h1>
            <SpaceFilter />
            <SpaceGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
