import { useQuery } from "@tanstack/react-query";
import { CustomLink } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as Icons from "lucide-react";

export function CustomLinks() {
  const { data: links } = useQuery<CustomLink[]>({
    queryKey: ["/api/custom-links"],
  });

  if (!links?.length) return null;

  // Group links by category
  const groupedLinks = links.reduce((acc, link) => {
    const category = link.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, CustomLink[]>);

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
        <AccordionItem key={category} value={category}>
          <AccordionTrigger className="text-sm font-semibold">
            {category}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              {categoryLinks.map((link) => {
                // Dynamically get icon from lucide-react
                const IconComponent = (Icons as any)[link.icon] || Icons.Link;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {link.title}
                    </Button>
                  </a>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
