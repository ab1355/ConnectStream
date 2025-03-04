import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TaskList } from "@/components/features/tasks/task-list";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <TaskList />
          </div>
        </main>
      </div>
    </div>
  );
}
