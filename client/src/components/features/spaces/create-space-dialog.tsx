import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSpaceSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PrivacySelect } from "./privacy-select";

export function CreateSpaceDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertSpaceSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
    },
  });

  const createSpaceMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/spaces", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spaces"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Space created",
        description: "Your new space has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create space. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Space</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
          <DialogDescription>
            Create a new space to bring people together around a shared interest or goal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createSpaceMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter space name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this space is about"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy</FormLabel>
                  <FormControl>
                    <PrivacySelect 
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSpaceMutation.isPending}>
                Create Space
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}