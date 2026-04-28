"use client";

import React, { useState } from "react";
import { Upload, Play, FileVideo, CheckCircle, AlertCircle } from "lucide-react";

interface WarzoneAnalyzerProps {
  userId: string;
}

export function WarzoneAnalyzer({ userId }: WarzoneAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyze, setAnalyze] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("userId", userId);

      const res = await fetch("/api/warzone/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd uploadu");
        return;
      }

      setResult({ ...data, status: "uploaded" });
    } catch (err) {
      setError("Błąd połączenia z Warzone Analyzer");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!result?.videoId) return;

    setAnalyze(true);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/warzone/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisId: result.analysisId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd analizy");
        return;
      }

      setResult({ ...result, ...data, status: "analyzing" });
    } catch (err) {
      setError("Błąd podczas analizy");
    } finally {
      setAnalyze(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileVideo className="text-[var(--color-general)] w-6 h-6" />
        <h2 className="text-xl font-bold text-white">Warzone Analyzer</h2>
      </div>

      <div className="space-y-4">
        <div
          className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-[var(--color-general)]/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("video-upload")?.click()}
        >
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">Kliknij lub przeciągnij plik wideo</p>
          <p className="text-sm text-white/40 mt-1">MP4, MOV, AVI (max 500MB)</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {file && (
          <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
            <FileVideo className="text-[var(--color-general)]" />
            <div className="flex-1">
              <p className="text-white font-medium truncate">
                {file.name}
              </p>
              <p className="text-sm text-white/40">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setError(null);
                setResult(null);
              }}
              className="text-white/40 hover:text-white/80"
            >
              ×
            </button>
          </div>
        )}

        {result && result.status === "uploaded" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-400 text-sm">Video gotowe do analizy</span>
          </div>
        )}

        {result && result.status === "analyzing" && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white/50 border-t-white/50 rounded-full animate-spin" />
            <span className="text-blue-400 text-sm">Analizowanie...</span>
          </div>
        )}

        {result && result.status === "completed" && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 flex items-center gap-3">
            <Play className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm">
              Analiza zakończona - obejrzyj wynik
            </span>
          </div>
        )}

        {file && result?.status !== "completed" && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3 rounded-xl bg-[var(--color-general)] hover:bg-[var(--color-general)]/80 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? "Analizowanie..." : "Zanalizuj Video"}
          </button>
        )}

        {result && result.status === "completed" && (
          <div className="bg-white/5 rounded-xl overflow-hidden">
            <video
              controls
              className="w-full rounded-xl"
              src={result.url}
            />
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/50 text-xs">FPS</p>
                <p className="text-white text-xl font-bold">
                  {result.results?.aim?.fps || "N/A"}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/50 text-xs">Celność</p>
                <p className="text-white text-xl font-bold">
                  {result.results?.aim?.accuracy || "N/A"}%
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/50 text-xs">Czas reakcji</p>
                <p className="text-white text-xl font-bold">
                  {result.results?.aim?.avg_reaction_time || "N/A"}ms
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/50 text-xs">Ruch</p>
                <p className="text-white text-xl font-bold">
                  {result.results?.movement?.positions?.length || 0} pts
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WarzoneAnalyzer;
