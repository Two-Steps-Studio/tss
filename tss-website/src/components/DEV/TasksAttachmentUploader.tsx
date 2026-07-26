"use client";

import type { DevTask, DevTaskAttachment } from "@/lib/types/dev-types";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskAttachmentsProps {
  task: DevTask;
  attachments: DevTaskAttachment[];
  onAttachmentsChanged?: (attachments: DevTaskAttachment[]) => void;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_ATTACHMENT_SIZE_MB = 5;

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
}

export function TasksAttachmentUploader({ task, attachments, onAttachmentsChanged }: TaskAttachmentsProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, GIF, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${MAX_ATTACHMENT_SIZE_MB}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64 for storage (in production, use Supabase Storage)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(`/api/dev-tasks/${task.id}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            file_url: base64,
            file_size: file.size,
            mime_type: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload attachment");
        }

        const newAttachment = await response.json();
        onAttachmentsChanged?.([...attachments, newAttachment]);
        
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      };
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [task.id, attachments, onAttachmentsChanged, toast]);

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      const response = await fetch(`/api/dev-tasks/${task.id}/attachments?attachmentId=${attachmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete attachment");
      }

      onAttachmentsChanged?.(attachments.filter((a) => a.id !== attachmentId));
      
      toast({
        title: "Success",
        description: "Attachment deleted",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-6 text-center hover:border-[var(--color-dev)]/50 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Drop image here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {MAX_ATTACHMENT_SIZE_MB}MB • JPEG, PNG, GIF, WebP
          </p>
        </label>
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="rounded-2xl border-[var(--border-color)] overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={attachment.file_url}
                  alt={attachment.file_name}
                  fill
                  className="object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  onClick={() => handleDeleteAttachment(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
