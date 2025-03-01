import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

export function GifPicker({ onSelect }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: gifs, isLoading } = useQuery({
    queryKey: ['/api/gifs/search', search],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: search || 'trending',
        limit: '20',
      });
      const res = await fetch(`/api/gifs/search?${params}`);
      return res.json();
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          GIF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search GIFs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-muted rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {gifs?.data.map((gif: any) => (
                  <button
                    key={gif.id}
                    className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-ring transition-all"
                    onClick={() => {
                      onSelect(gif.images.original.url);
                      setOpen(false);
                    }}
                  >
                    <img
                      src={gif.images.fixed_height.url}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
