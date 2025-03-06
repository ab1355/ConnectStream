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
  CommandLoading,
} from "@/components/ui/command";
import { User, Post, Space, Course, Discussion } from "@shared/schema"; // Kept Discussion type
import { Search, User as UserIcon, FileText, Layout, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  users: User[];
  posts: Post[];
  spaces: Space[];
  courses: Course[];
  discussions: Discussion[]; // Corrected type
}

export function UniversalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const debouncedSearch = useDebounce(search, 300);

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

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", { q: debouncedSearch }], // Updated query key
    enabled: !!debouncedSearch && debouncedSearch.length >= 2,
  });

  const hasResults = searchResults && Object.values(searchResults).some(arr => arr.length > 0);

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

      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        aria-describedby="search-description"
      >
        <DialogTitle className="sr-only">Search across platform</DialogTitle>
        <div id="search-description" className="sr-only">
          Search across members, posts, spaces, courses, and discussions. Use up and down arrows to navigate results.
        </div>
        <CommandInput 
          placeholder="Search across the platform..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {isLoading && (
            <CommandLoading>
              <div className="flex items-center justify-center py-6">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            </CommandLoading>
          )}

          {!isLoading && !hasResults && search && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {(!search || search.length < 2) && (
            <CommandEmpty>Enter at least 2 characters to search...</CommandEmpty>
          )}

          {searchResults?.users?.length > 0 && (
            <CommandGroup heading="Members">
              {searchResults.users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelect("member", user.id.toString())}
                >
                  <div className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span>{user.displayName || user.username}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults?.posts?.length > 0 && (
            <CommandGroup heading="Posts">
              {searchResults.posts.map((post) => (
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

          {searchResults?.spaces?.length > 0 && (
            <CommandGroup heading="Spaces">
              {searchResults.spaces.map((space) => (
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

          {searchResults?.courses?.length > 0 && (
            <CommandGroup heading="Courses">
              {searchResults.courses.map((course) => (
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

          {searchResults?.discussions?.length > 0 && (
            <CommandGroup heading="Discussions">
              {searchResults.discussions.map((discussion) => (
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