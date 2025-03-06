import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Eye, EyeOff, Image as ImageIcon } from "lucide-react";

interface SpaceCardProps {
  name: string;
  description: string;
  memberCount: number;
  privacy: "public" | "private" | "secret";
  imageUrl?: string;
}

export function SpaceCard({ name, description, memberCount, privacy, imageUrl }: SpaceCardProps) {
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
        <Button variant="outline" size="sm">Join Space</Button>
      </CardFooter>
    </Card>
  );
}