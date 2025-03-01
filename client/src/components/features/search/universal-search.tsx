import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { User, Post } from "@shared/schema";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UniversalSearch() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch all searchable data
  const { data: users } = useQuery<User[]>({ 
    queryKey: ["/api/users"],
  });
  const { data: posts } = useQuery<Post[]>({ 
    queryKey: ["/api/posts"],
  });

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    switch (type) {
      case "member":
        setLocation(`/members/${id}`);
        break;
      case "post":
        setLocation(`/feed/${id}`);
        break;
      // Add more cases as needed
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search across the platform..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {users && users.length > 0 && (
            <CommandGroup heading="Members">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelect("member", user.id.toString())}
                >
                  <span>{user.displayName || user.username}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {posts && posts.length > 0 && (
            <CommandGroup heading="Posts">
              {posts.map((post) => (
                <CommandItem
                  key={post.id}
                  onSelect={() => handleSelect("post", post.id.toString())}
                >
                  <span>{post.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}