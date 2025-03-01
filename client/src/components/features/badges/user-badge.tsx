import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Achievement } from "@shared/schema";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface UserBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function UserBadge({ 
  achievement, 
  size = "md", 
  showTooltip = true 
}: UserBadgeProps) {
  // Dynamically get the icon component from lucide-react
  const IconComponent = Icons[achievement.icon as keyof typeof Icons] as LucideIcon;

  const badgeContent = (
    <Badge
      variant={achievement.badgeType === "special" ? "default" : "secondary"}
      className={cn(
        "flex items-center gap-1",
        size === "sm" && "text-xs py-0 px-2",
        size === "md" && "text-sm py-1 px-3",
        size === "lg" && "text-base py-2 px-4",
        achievement.badgeColor && `bg-[${achievement.badgeColor}]`
      )}
    >
      {IconComponent && <IconComponent className={cn(
        "shrink-0",
        size === "sm" && "h-3 w-3",
        size === "md" && "h-4 w-4",
        size === "lg" && "h-5 w-5"
      )} />}
      {achievement.name}
    </Badge>
  );

  if (!showTooltip) return badgeContent;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{achievement.name}</p>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        <p className="text-xs text-muted-foreground mt-1">{achievement.points} points</p>
      </TooltipContent>
    </Tooltip>
  );
}
