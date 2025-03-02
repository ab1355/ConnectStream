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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SpaceBranding {
  id: number;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCss?: string;
}

export function SpaceBrandingManager() {
  const { toast } = useToast();
  const [selectedSpace, setSelectedSpace] = useState<string>();
  
  const { data: spaces = [], isLoading: spacesLoading } = useQuery({
    queryKey: ["/api/spaces"],
  });

  const { data: branding, isLoading: brandingLoading } = useQuery<SpaceBranding>({
    queryKey: ["/api/admin/spaces/branding", selectedSpace],
    enabled: !!selectedSpace,
  });

  const updateBrandingMutation = useMutation({
    mutationFn: async (data: Partial<SpaceBranding>) => {
      const res = await fetch(`/api/admin/spaces/${selectedSpace}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update space branding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/spaces/branding", selectedSpace] });
      toast({
        title: "Branding updated",
        description: "Space branding has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update space branding. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (spacesLoading || brandingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Space Branding</CardTitle>
        <CardDescription>
          Customize the appearance of individual spaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Space</Label>
            <Select value={selectedSpace} onValueChange={setSelectedSpace}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a space" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id.toString()}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSpace && (
            <Tabs defaultValue="branding">
              <TabsList>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="custom">Custom CSS</TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    placeholder="Enter logo URL"
                    value={branding?.logoUrl || ""}
                    onChange={(e) => updateBrandingMutation.mutate({ logoUrl: e.target.value })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={branding?.primaryColor || "#000000"}
                      onChange={(e) => updateBrandingMutation.mutate({ primaryColor: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={branding?.primaryColor || ""}
                      onChange={(e) => updateBrandingMutation.mutate({ primaryColor: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={branding?.secondaryColor || "#000000"}
                      onChange={(e) => updateBrandingMutation.mutate({ secondaryColor: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={branding?.secondaryColor || ""}
                      onChange={(e) => updateBrandingMutation.mutate({ secondaryColor: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom CSS</Label>
                  <textarea
                    className="w-full min-h-[200px] p-2 border rounded-md font-mono text-sm"
                    value={branding?.customCss || ""}
                    onChange={(e) => updateBrandingMutation.mutate({ customCss: e.target.value })}
                    placeholder=".space-custom { /* Custom styles */ }"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
