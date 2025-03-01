import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const slugSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  title: z.string().min(1, "Title is required"),
});

type SlugFormData = z.infer<typeof slugSchema>;

export default function CustomSlugPage() {
  const { toast } = useToast();
  const form = useForm<SlugFormData>({
    resolver: zodResolver(slugSchema),
    defaultValues: {
      slug: "",
      title: "",
    },
  });

  // Query existing custom slug
  const { data: customLinks } = useQuery({
    queryKey: ["/api/custom-links"],
  });

  const slugLink = customLinks?.find(link => link.category === "slug");

  // Mutation for updating slug
  const updateSlugMutation = useMutation({
    mutationFn: async (data: SlugFormData) => {
      if (slugLink) {
        return apiRequest("PATCH", `/api/custom-links/${slugLink.id}`, {
          ...data,
          category: "slug",
          icon: "link",
        });
      } else {
        return apiRequest("POST", "/api/custom-links", {
          ...data,
          category: "slug",
          icon: "link",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-links"] });
      toast({
        title: "Success",
        description: "Custom URL slug has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update custom URL slug.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SlugFormData) => {
    updateSlugMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Custom URL Slug</h1>
            <Card className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="title">
                    Title
                  </label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    defaultValue={slugLink?.title}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="slug">
                    Custom Slug
                  </label>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    defaultValue={slugLink?.slug || ""}
                    placeholder="my-custom-url"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={updateSlugMutation.isPending}
                >
                  {updateSlugMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
