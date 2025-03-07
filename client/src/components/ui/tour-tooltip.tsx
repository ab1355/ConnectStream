import * as React from "react";
import {
  Arrow,
  Content,
  Portal,
  Provider,
  Root,
} from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export interface TourTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  hideArrow?: boolean;
}

export function TourTooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  className,
  side = "top",
  hideArrow = false,
}: TourTooltipProps) {
  return (
    <Provider>
      <Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Content
          side={side}
          className={cn(
            "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
        >
          {content}
          {!hideArrow && (
            <Arrow className="fill-primary" width={8} height={4} />
          )}
        </Content>
        {children}
      </Root>
    </Provider>
  );
}
