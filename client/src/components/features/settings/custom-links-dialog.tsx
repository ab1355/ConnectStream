import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomLinkSchema, type InsertCustomLink } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "social", label: "Social Media" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
];

const commonIcons = ["Link", "Globe", "Facebook", "Twitter", "Instagram", "Youtube", "Linkedin", "Github", "CreditCard", "DollarSign", "Bank", "Bookmark"];

export function CustomLinksDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCustomLink>({
    resolver: zodResolver(insertCustomLinkSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: "Link",
      category: "other",
      order: 0,
    },
  });

  const addLinkMutation = useMutation({
    mutationFn: async (data: InsertCustomLink) => {
      const res = await apiRequest("POST", "/api/custom-links", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-links"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Link added",
        description: "Your custom link has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add custom link. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add Custom Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Link</DialogTitle>
          <DialogDescription>
            Add a custom link to your sidebar for quick access.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((data) => addLinkMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Link title"
              {...form.register("title")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              {...form.register("url")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) => form.setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {commonIcons.map((iconName) => {
                  const IconComponent = (Icons as any)[iconName];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {iconName}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addLinkMutation.isPending}
            >
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}