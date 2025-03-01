import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete?: (fileData: {
    id: number;
    url: string;
    filename: string;
    mimeType: string;
  }) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "image/*",
  maxSize = 5 * 1024 * 1024 // 5MB
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size should not exceed ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setProgress(0);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      onUploadComplete?.(data);
      
      toast({
        title: "Upload complete",
        description: "Your file has been uploaded successfully.",
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept={accept}
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Select File
        </Button>
        {selectedFile && (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedFile.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {selectedFile && !uploading && (
        <Button onClick={handleUpload} disabled={uploading}>
          Upload
        </Button>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
