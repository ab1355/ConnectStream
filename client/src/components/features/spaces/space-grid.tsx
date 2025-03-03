import { useQuery } from "@tanstack/react-query";
import { SpaceCard } from "./space-card";
import { Space } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SpaceGrid() {
  const { data: spaces, isLoading, error } = useQuery<Space[]>({
    queryKey: ["/api/spaces"],
  });

  if (isLoading) {
    return (
      <LoadingScreen 
        variant="inline" 
        message="Loading spaces..." 
      />
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading spaces. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!spaces?.length) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No spaces available. Create one to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <SpaceCard 
          key={space.id}
          name={space.name}
          description={space.description || ""}
          privacy={space.privacy as "public" | "private" | "secret"}
          memberCount={space.memberCount || 0}
          imageUrl={`https://picsum.photos/seed/${space.id}/800/400`}
        />
      ))}
    </div>
  );
}