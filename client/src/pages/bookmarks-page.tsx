import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/features/feed/post-card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface BookmarkedPost {
  id: number;
  createdAt: string;
  post: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    authorId: number;
  };
}

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useQuery<BookmarkedPost[]>({
    queryKey: ["/api/bookmarks"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Bookmarks</h1>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !bookmarks?.length ? (
              <div className="text-center text-muted-foreground p-8">
                No bookmarks yet. Save posts by clicking the bookmark icon!
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <PostCard key={bookmark.id} post={bookmark.post} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
