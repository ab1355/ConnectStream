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
import { Search, User as UserIcon, FileText, Layout, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UniversalSearch() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

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
  const { data: spaces } = useQuery({ 
    queryKey: ["/api/spaces"],
  });
  const { data: courses } = useQuery({ 
    queryKey: ["/api/courses"],
  });
  const { data: discussions } = useQuery({ 
    queryKey: ["/api/discussions"],
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
      case "space":
        setLocation(`/spaces/${id}`);
        break;
      case "course":
        setLocation(`/courses/${id}`);
        break;
      case "discussion":
        setLocation(`/discussions/${id}`);
        break;
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
        <CommandInput placeholder="Search across the platform (members, posts, spaces, courses, discussions)..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {users && users.length > 0 && (
            <CommandGroup heading="Members">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelect("member", user.id.toString())}
                >
                  <div className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span>{user.displayName || user.username}</span>
                  </div>
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
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{post.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {spaces && spaces.length > 0 && (
            <CommandGroup heading="Spaces">
              {spaces.map((space) => (
                <CommandItem
                  key={space.id}
                  onSelect={() => handleSelect("space", space.id.toString())}
                >
                  <Layout className="mr-2 h-4 w-4" />
                  <span>{space.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {courses && courses.length > 0 && (
            <CommandGroup heading="Courses">
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => handleSelect("course", course.id.toString())}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{course.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {discussions && discussions.length > 0 && (
            <CommandGroup heading="Discussions">
              {discussions.map((discussion) => (
                <CommandItem
                  key={discussion.id}
                  onSelect={() => handleSelect("discussion", discussion.id.toString())}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>{discussion.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}