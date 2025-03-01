import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { LeaderboardTable } from "@/components/features/leaderboard/leaderboard-table";
import { TimeframeSelector } from "@/components/features/leaderboard/timeframe-selector";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <TimeframeSelector />
            </div>
            <LeaderboardTable />
          </div>
        </main>
      </div>
    </div>
  );
}
