import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Hashtag } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MentionsInput({ value, onChange, placeholder, className }: MentionsInputProps) {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<'@' | '#' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: searchResults } = useQuery<User[]>({
    queryKey: ['/api/users/search', searchTerm],
    queryFn: () => fetch(`/api/users/search?q=${searchTerm}`).then(res => res.json()),
    enabled: trigger === '@' && searchTerm.length > 0
  });

  const { data: hashtags } = useQuery<Hashtag[]>({
    queryKey: ['/api/hashtags/trending'],
    enabled: trigger === '#'
  });

  useEffect(() => {
    if (!value) return;

    const cursorPos = inputRef.current?.selectionStart || 0;
    setCursorPosition(cursorPos);

    // Find the trigger character before cursor
    const beforeCursor = value.slice(0, cursorPos);
    const words = beforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setTrigger('@');
      setSearchTerm(lastWord.slice(1));
      setOpen(true);
    } else if (lastWord.startsWith('#')) {
      setTrigger('#');
      setSearchTerm(lastWord.slice(1));
      setOpen(true);
    } else {
      setOpen(false);
      setTrigger(null);
    }
  }, [value, cursorPosition]);

  const insertMention = (username: string) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const words = beforeCursor.split(/\s/);
    words.pop(); // Remove the partial @mention
    const newValue = `${words.join(' ')} @${username} ${afterCursor}`;
    onChange(newValue.trim());
    setOpen(false);
  };

  const insertHashtag = (hashtag: string) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const words = beforeCursor.split(/\s/);
    words.pop(); // Remove the partial #hashtag
    const newValue = `${words.join(' ')} #${hashtag} ${afterCursor}`;
    onChange(newValue.trim());
    setOpen(false);
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div /> {/* Empty trigger, popover controlled by input */}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput
              placeholder={trigger === '@' ? "Search users..." : "Search hashtags..."}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>No results found</CommandEmpty>
            {trigger === '@' && searchResults && (
              <CommandGroup>
                {searchResults.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => insertMention(user.username)}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {user.displayName?.[0] || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.displayName || user.username}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {trigger === '#' && hashtags && (
              <CommandGroup>
                {(hashtags || []).map((hashtag) => (
                  <CommandItem
                    key={hashtag.id}
                    onSelect={() => insertHashtag(hashtag.name)}
                  >
                    #{hashtag.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {hashtag.count} posts
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}