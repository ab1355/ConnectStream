import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Eye, EyeOff, Image as ImageIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SpaceCardProps {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  privacy: "public" | "private" | "secret";
  imageUrl?: string;
}

export function SpaceCard({ id, name, description, memberCount, privacy, imageUrl }: SpaceCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const deleteSpaceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/spaces/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete space");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spaces"] });
      toast({
        title: "Space deleted",
        description: "The space has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete space. Please try again.",
        variant: "destructive",
      });
    },
  });

  const privacyConfig = {
    public: {
      icon: Eye,
      label: "Public",
      variant: "secondary" as const,
    },
    private: {
      icon: Lock,
      label: "Private",
      variant: "outline" as const,
    },
    secret: {
      icon: EyeOff,
      label: "Secret",
      variant: "destructive" as const,
    },
  };

  const { icon: PrivacyIcon, label, variant } = privacyConfig[privacy];

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <Badge
          variant={variant}
          className="absolute top-2 right-2 flex items-center gap-1"
        >
          <PrivacyIcon className="h-3 w-3" />
          {label}
        </Badge>
      </div>
      <CardHeader>
        <h3 className="font-semibold text-lg">{name}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          {memberCount} members
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Join Space</Button>
          {isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteSpaceMutation.mutate()}
              disabled={deleteSpaceMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}