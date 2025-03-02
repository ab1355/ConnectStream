import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children, className, ...props }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
          "hover:bg-accent rounded-md",
          className
        )}
        {...props}
      >
        {children}
      </a>
    </Link>
  );
}
