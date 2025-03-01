import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const themeSettingsSchema = z.object({
  themePreference: z.enum(["light", "dark", "system"]),
  themeColor: z.string(),
  themeRadius: z.string(),
  themeVariant: z.enum(["professional", "tint", "vibrant"]),
});

type ThemeSettingsForm = z.infer<typeof themeSettingsSchema>;

export function ThemeSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ThemeSettingsForm>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      themePreference: (user?.themePreference as "light" | "dark" | "system") ?? "system",
      themeColor: user?.themeColor ?? "blue",
      themeRadius: user?.themeRadius ?? "0.5",
      themeVariant: (user?.themeVariant as "professional" | "tint" | "vibrant") ?? "professional",
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (data: ThemeSettingsForm) => {
      const res = await apiRequest("PATCH", "/api/user/theme", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Theme updated",
        description: "Your theme preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update theme",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ThemeSettingsForm) => {
    updateThemeMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="themePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme Mode</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose your preferred theme mode
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="themeColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} className="h-10 px-3 w-20" />
              </FormControl>
              <FormDescription>
                Select your primary theme color
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="themeRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Border Radius</FormLabel>
              <FormControl>
                <Input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  {...field}
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                Adjust the roundness of corners
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="themeVariant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme Variant</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme variant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="tint">Tint</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the style of your theme
              </FormDescription>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={updateThemeMutation.isPending}
        >
          Save theme preferences
        </Button>
      </form>
    </Form>
  );
}
