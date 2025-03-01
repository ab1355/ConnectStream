import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CreatePost } from "@/components/features/feed/create-post";
import { PostList } from "@/components/features/feed/post-list";
import { ContentFilter } from "@/components/features/feed/content-filter";

export default function FeedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Feed</h1>
            <CreatePost />
            <ContentFilter />
            <PostList />
          </div>
        </main>
      </div>
    </div>
  );
}