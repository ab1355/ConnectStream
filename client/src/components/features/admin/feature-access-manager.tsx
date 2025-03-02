import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

const DEFAULT_FEATURES = [
  {
    id: "spaces",
    name: "Spaces",
    description: "Allow users to create and join spaces"
  },
  {
    id: "courses",
    name: "Courses",
    description: "Access to learning courses and materials"
  },
  {
    id: "discussions",
    name: "Discussions",
    description: "Participate in community discussions"
  },
  {
    id: "polls",
    name: "Polls & Surveys",
    description: "Create and respond to community polls"
  },
  {
    id: "messages",
    name: "Messages",
    description: "Send private messages to other users"
  },
  {
    id: "custom_urls",
    name: "Custom URLs",
    description: "Create custom URLs for profiles and spaces"
  }
];

export function FeatureAccessManager() {
  const { toast } = useToast();
  
  const { data: features = [], isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/admin/features"],
    select: (data) => {
      // Merge default features with server data
      return DEFAULT_FEATURES.map(defaultFeature => ({
        ...defaultFeature,
        enabled: data.find(f => f.id === defaultFeature.id)?.enabled ?? true
      }));
    }
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw new Error("Failed to update feature access");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      toast({
        title: "Feature access updated",
        description: "The changes have been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feature access. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleToggle = (id: string, enabled: boolean) => {
    updateFeatureMutation.mutate({ id, enabled });
  };

  if (isLoading) {
    return <div>Loading feature settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Access Control</CardTitle>
        <CardDescription>
          Enable or disable access to various platform features for all users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={feature.id}>{feature.name}</Label>
                <div className="text-sm text-muted-foreground">
                  {feature.description}
                </div>
              </div>
              <Switch
                id={feature.id}
                checked={feature.enabled}
                onCheckedChange={(checked) => handleToggle(feature.id, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
