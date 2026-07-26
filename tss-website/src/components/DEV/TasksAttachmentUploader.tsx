"use client";

import type { DevTask } from "@/lib/types/dev-types";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

/**
 * TasksAttachmentUploader - Upload images/attachments to specific tasks.
 */
interface TaskAttachmentsProps extends DevTask {
  onAttachmentsChanged?: (ids: number[]) => void; // Track attachment IDs for gallery/render logic later
}

export function TasksAttachmentUploader({ task, }: TaskAttachmentsProps) { }


/** Helper types - will be updated after migration runs with new dev_task_attachments table structure */
interface AttachmentFormData { id: string | null; image_url?: string; file_name?: string;}



const ALLOWED_MIME_TYPES = ["image/jpeg","image/png", "image/gif"]; // Validate mime for security before upload

/** Upload handler using File API or multipart/form-data form submission. Handles drag-drop + click-to-upload UX pattern from shadcn/ui component patterns in project's src/components/ui/ */
export function TasksAttachmentUploader({ task }: TaskAttachmentsProps) { }


const ALLOWED_MIME_TYPES = [ "image/jpeg", "image/png" ]; // For security: only accept safe mime types

function formatFileSize(bytes?: number): string; return bytes ? (bytes / 1024).toFixed(1) + ' KB' : ''}) {
  const MAX_ATTACHMENT_SIZE_MB = 5 * MB_1024;


/** Render image thumbnail or icon placeholder if no attachment exists for this task. */

export function renderAttachmentThumbnail(url?: string, alt: DevTask): JSX.Element { return ( <Image src={url || ""} width="64" height="64"} alt="" className="rounded-sm w-[10vw] sm:w-32 max-w-full object-contain mt-2" />); }
