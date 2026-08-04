"use client";

import { useDevProject } from "@/contexts/dev-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  FileText,
  ImageIcon,
  Music,
  Code,
  Folder,
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
  Upload,
  HardDrive
} from "lucide-react";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FileCategory } from "@/lib/types/dev-types";

// Allowed file extensions for dev files
const ALLOWED_DEV_FILE_EXTENSIONS = ['.txt', '.md', '.json', '.yaml', '.yml', '.xml', '.csv', '.log', '.ini', '.config'];
const FILE_SIZE_LIMITS = {
  DEV_FILE: 10 * 1024 * 1024, // 10MB
};

const categoryIcons: Record<FileCategory, React.ReactNode> = {
  documentation: <FileText size={20} className="text-blue-500" />,
  graphics: <ImageIcon size={20} className="text-purple-500" />,
  audio: <Music size={20} className="text-green-500" />,
  source_code: <Code size={20} className="text-orange-500" />,
  other: <Folder size={20} className="text-gray-500" />,
};

const categoryColors: Record<FileCategory, string> = {
  documentation: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  graphics: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  audio: "bg-green-500/10 text-green-500 border-green-500/20",
  source_code: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function DevFiles() {
  const { files, activeProject, addFile, uploadFile, deleteFile, isLoading, error, storageUsage, storageLimit } = useDevProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileCategory, setNewFileCategory] = useState<FileCategory>("other");
  const [uploadFileCategory, setUploadFileCategory] = useState<FileCategory>("other");
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFile = async () => {
    if (!newFileName.trim() || !activeProject) return;
    setIsCreating(true);
    try {
      await addFile({
        name: newFileName,
        file_url: newFileUrl || undefined,
        category: newFileCategory,
      });
      setNewFileName("");
      setNewFileUrl("");
      setNewFileCategory("other");
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      await deleteFile(id);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!activeProject) return;

    // Validate file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_DEV_FILE_EXTENSIONS.includes(extension)) {
      setUploadError(`Nieobsługiwane rozszerzenie. Dozwolone: ${ALLOWED_DEV_FILE_EXTENSIONS.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.DEV_FILE) {
      setUploadError(`Plik jest za duży. Maksymalny rozmiar: 10MB`);
      return;
    }

    // Check storage limit
    if (storageUsage + file.size > storageLimit) {
      const usedMB = (storageUsage / (1024 * 1024)).toFixed(0);
      const limitMB = (storageLimit / (1024 * 1024)).toFixed(0);
      setUploadError(`Limit przekroczony. Obecnie: ${usedMB}MB, Limit: ${limitMB}MB`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      await uploadFile(file, uploadFileCategory);
      setIsUploadOpen(false);
      setUploadFileCategory("other");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const formatStorageSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const storagePercentage = (storageUsage / storageLimit) * 100;

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "-";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-dev)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a project to view files</p>
        </div>
      </div>
    );
  }

  const filesByCategory: Record<FileCategory, typeof files> = {
    documentation: files.filter((f) => f.category === "documentation"),
    graphics: files.filter((f) => f.category === "graphics"),
    audio: files.filter((f) => f.category === "audio"),
    source_code: files.filter((f) => f.category === "source_code"),
    other: files.filter((f) => f.category === "other"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            <span className="text-[var(--color-dev)]">Files</span>
          </h1>
          <p className="text-muted-foreground">Manage files for <span className="text-[var(--color-dev)]">{activeProject.name}</span></p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl border-[var(--border-color)]">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]">
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={uploadFileCategory} onValueChange={(val: FileCategory) => setUploadFileCategory(val)}>
                    <SelectTrigger className="rounded-2xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]">
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="graphics">Graphics</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="source_code">Source Code</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    disabled={isUploading}
                    className="rounded-2xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Dozwolone: {ALLOWED_DEV_FILE_EXTENSIONS.join(', ')} | Max: 10MB
                  </p>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl border-[var(--border-color)]" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add URL
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]">
              <DialogHeader>
                <DialogTitle>Add File from URL</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">File Name</Label>
                  <Input
                    id="name"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name"
                    className="rounded-2xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]"
                  />
                </div>
                <div>
                  <Label htmlFor="url">File URL (optional)</Label>
                  <Input
                    id="url"
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    className="rounded-2xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newFileCategory} onValueChange={(val: FileCategory) => setNewFileCategory(val)}>
                    <SelectTrigger className="rounded-2xl bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--card-bg)] text-[var(--text)] border-[var(--border-color)]">
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="graphics">Graphics</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="source_code">Source Code</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddFile} disabled={isCreating} className="w-full rounded-2xl">
                  {isCreating ? "Adding..." : "Add File"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Storage Usage */}
      <Card className="rounded-3xl border-[var(--border-color)] bg-[var(--card-bg)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[var(--color-dev)]" />
              <span className="text-sm font-medium text-[var(--text)]">Storage projektu</span>
            </div>
            <span className="text-sm font-bold text-[var(--text)]">
              {formatStorageSize(storageUsage)} / {formatStorageSize(storageLimit)}
            </span>
          </div>
          <div className="w-full bg-[var(--bg)] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[var(--color-dev)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {storagePercentage.toFixed(1)}% wykorzystane
          </p>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {files.length === 0 ? (
        <Card className="rounded-3xl border-[var(--border-color)]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Folder className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No files yet</p>
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              Add First File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(filesByCategory).map(([category, categoryFiles]) => (
            categoryFiles.length > 0 && (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                  {categoryIcons[category as FileCategory]}
                  {category.replace("_", " ")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryFiles.map((file) => (
                    <Card key={file.id} className="rounded-3xl border-[var(--border-color)] hover:border-[var(--color-dev)]/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
                              {categoryIcons[file.category]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{file.name}</h3>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`rounded-full text-xs ${categoryColors[file.category]}`}
                            variant="outline"
                          >
                            {file.category}
                          </Badge>
                          {file.file_url && (
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--color-dev)] transition-colors"
                            >
                              <ExternalLink size={12} />
                              Open
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
