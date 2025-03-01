import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = [
  { id: "all", name: "All Categories", count: 128 },
  { id: "announcements", name: "Announcements", count: 12 },
  { id: "general", name: "General Discussion", count: 45 },
  { id: "help", name: "Help & Support", count: 32 },
  { id: "feedback", name: "Feedback", count: 18 },
  { id: "introductions", name: "Introductions", count: 21 },
];

interface CategoryNavigationProps {
  className?: string;
}

export function CategoryNavigation({ className }: CategoryNavigationProps) {
  return (
    <ScrollArea className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="space-y-1">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            className="w-full justify-start font-normal"
          >
            <span className="truncate">{category.name}</span>
            <span className="ml-auto text-muted-foreground">
              {category.count}
            </span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
