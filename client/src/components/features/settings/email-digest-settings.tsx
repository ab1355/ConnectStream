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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const emailPreferencesSchema = z.object({
  emailDigestEnabled: z.boolean(),
  emailDigestFrequency: z.enum(["daily", "weekly"]),
  email: z.string().email("Invalid email address"),
});

type EmailPreferencesForm = z.infer<typeof emailPreferencesSchema>;

export function EmailDigestSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<EmailPreferencesForm>({
    resolver: zodResolver(emailPreferencesSchema),
    defaultValues: {
      emailDigestEnabled: user?.emailDigestEnabled ?? true,
      emailDigestFrequency: user?.emailDigestFrequency ?? "daily",
      email: user?.email ?? "",
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: EmailPreferencesForm) => {
      const res = await apiRequest("PATCH", "/api/user/email-preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Preferences updated",
        description: "Your email digest preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailPreferencesForm) => {
    updatePreferencesMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <input
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your email address for receiving digests and notifications.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailDigestEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Digest</FormLabel>
                <FormDescription>
                  Receive a summary of community activity.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailDigestFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Digest Frequency</FormLabel>
              <Select
                disabled={!form.watch("emailDigestEnabled")}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often you'd like to receive the digest.
              </FormDescription>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={updatePreferencesMutation.isPending}
        >
          Save preferences
        </Button>
      </form>
    </Form>
  );
}
