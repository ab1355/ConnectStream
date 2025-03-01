import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface SpaceCardProps {
  name: string;
  description: string;
  memberCount: number;
  imageUrl: string;
}

export function SpaceCard({ name, description, memberCount, imageUrl }: SpaceCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={imageUrl} 
          alt={name}
          className="object-cover w-full h-full"
        />
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
