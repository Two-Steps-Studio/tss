"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileVideo, AlertCircle } from "lucide-react";

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  maxSize: number;
  acceptedFormats: string[];
}

export default function VideoUploader({
  onFileSelect,
  maxSize,
  acceptedFormats,
}: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    validateAndProcessFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file: File | null) => {
    if (!file) return;

    const maxSizeMB = maxSize / (1024 * 1024);
    const maxSizeFormatted = maxSizeMB >= 1000 ? `${Math.round(maxSizeMB / 1000)} MB` : `${maxSizeMB} MB`;

    if (file.size > maxSize) {
      setError(`Plik za duży. Maksymalny rozmiar: ${maxSizeFormatted}`);
      return;
    }

    const validFormats = acceptedFormats.join(", ");
    if (!acceptedFormats.includes(file.type)) {
      setError(`Nieobsługany format. Akceptowane: ${validFormats}`);
      return;
    }

    onFileSelect(file);
    setError(null);
  };

  return (
    <Card className="bg-white/0 dark:bg-black/40 border-2 border-black dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl font-black">Upload wideo</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive
              ? "border-[var(--color-general)]/50 bg-[var(--color-general)]/10"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedFormats.join(",")}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <Upload className="mx-auto mb-4 w-12 h-12 text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-300 font-medium mb-2">
            Przeciągnij i upuść wideo
          </p>
          <p className="text-sm text-zinc-500">
            lub kliknij, aby wybrać plik
          </p>
          <p className="text-xs text-zinc-400 mt-4">
            Formaty: {acceptedFormats.map((f) => f.split("/")[1]).join(", ")}
            <br />
            Maksymalny rozmiar: {maxSize / (1024 * 1024)} MB
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button
          onClick={() => {
            const fileInput = document.querySelector('input[type="file"]');
            fileInput?.click();
          }}
          className="w-full mt-4 bg-[var(--color-general)] hover:bg-[var(--color-general)]/90"
        >
          Wybierz plik
        </Button>
      </CardContent>
    </Card>
  );
}
