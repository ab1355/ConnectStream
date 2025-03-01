import { useQuery } from "@tanstack/react-query";
import { Space } from "@shared/schema";
import { SpaceCard } from "./space-card";
import { Loader2 } from "lucide-react";

export function SpaceGrid() {
  const { data: spaces, isLoading, error } = useQuery<Space[]>({
    queryKey: ["/api/spaces"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        Error loading spaces. Please try again.
      </div>
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
          memberCount={0} // TODO: Implement member count
          imageUrl={`https://picsum.photos/seed/${space.id}/800/400`}
        />
      ))}
    </div>
  );
}