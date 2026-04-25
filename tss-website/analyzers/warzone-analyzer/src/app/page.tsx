"use client";

import { useState } from "react";
import VideoUploader from "@/components/uploader/VideoUploader";
import PreviewPlayer from "@/components/preview/PreviewPlayer";
import ReportViewer from "@/components/report/ReportViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileVideo, AlertTriangle } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, any>>({});

  const handleFileSelect = async (file: File) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("userId", "user_123"); // TODO: Get from auth

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setFile(file);
      // Simulate video upload URL (in reality, serve from storage)
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisId(data.analysisId);
    } else {
      alert(data.error);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });

    const data = await response.json();

    if (data.success) {
      setAnalysis(data.results);
    } else {
      alert(data.error);
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-[var(--color-general)] to-[var(--color-games)] bg-clip-text text-transparent">
            Warzone Analyzer
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Analiza twojej gry w Call of Duty Warzone. Dowiedz się, jak możesz ulepszyć swoje umiejętności.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-white/0 dark:bg-black/40 border-2 border-black dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl font-black">
                  <Upload className="inline-block w-5 h-5 mr-2" />
                  Upload wideo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoUploader
                  onFileSelect={handleFileSelect}
                  maxSize={1073741824}
                  acceptedFormats={["video/mp4", "video/quicktime", "video/webm"]}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/0 dark:bg-black/40 border-2 border-black dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl font-black">
                  <FileVideo className="inline-block w-5 h-5 mr-2" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {file && (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <Badge variant="outline">Gatunek: {file.type.split("/")[1]}</Badge>
                      <Badge variant="outline">{(file.size / (1024 * 1024)).toFixed(1)} MB</Badge>
                    </div>

                    <PreviewPlayer
                      videoUrl={videoUrl}
                      analysisId={analysisId}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={isAnalyzing}
                    />

                    {analysisId && !videoUrl && (
                      <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        Wideo zostało przesłane. Kliknij "Analizuj", aby rozpocząć analizę.
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/0 dark:bg-black/40 border-2 border-black dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl font-black">Raport</CardTitle>
              </CardHeader>
              <CardContent>
                {!analysisId ? (
                  <div className="text-center text-zinc-500 py-12">
                    Prześlij wideo, aby zobaczyć raport
                  </div>
                ) : (
                  <ReportViewer analysis={analysis} />
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--color-general)]/10 to-transparent border-[var(--color-general)]/20">
              <CardContent className="pt-6">
                <div className="text-sm text-zinc-500">
                  <strong>Instrukcja:</strong> Nagraj lub pobierz swoje gameplay z Warzone,
                  a następnie prześlij go tutaj. System przeanalizuje twoją grę pod kątem
                  celności, ruchów, pozycjonowania i decyzji.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
