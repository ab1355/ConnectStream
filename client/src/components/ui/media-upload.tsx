import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
}

export function MediaUpload({ 
  onUpload, 
  accept = "image/*,video/*" 
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiRequest("POST", "/api/upload", formData);
      return res.json();
    },
    onSuccess: (data) => {
      onUpload(data.url);
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="media-upload"
      />
      <label htmlFor="media-upload">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          type="button"
          disabled={uploadMutation.isPending}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </label>

      {preview && (
        <div className="mt-2 relative">
          {preview.startsWith('data:video') ? (
            <video src={preview} controls className="max-w-full h-auto rounded-lg" />
          ) : (
            <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setPreview(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
