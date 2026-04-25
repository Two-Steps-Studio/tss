"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RefreshCw, Video } from "lucide-react";

interface PreviewPlayerProps {
  videoUrl: string;
  analysisId: string | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function PreviewPlayer({
  videoUrl,
  analysisId,
  onAnalyze,
  isAnalyzing,
}: PreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="bg-white/0 dark:bg-black/40 border-2 border-black dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl font-black">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                onClick={togglePlay}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="w-12 h-12 text-zinc-500" />
            </div>
          )}

          {analysisId && (
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="absolute top-4 right-4 bg-[var(--color-general)] hover:bg-[var(--color-general)]/90"
            >
              <RefreshCw className={isAnalyzing ? "animate-spin" : ""} className="w-4 h-4" />
              <span className="ml-2">{isAnalyzing ? "Analizowanie..." : "Analizuj"}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
