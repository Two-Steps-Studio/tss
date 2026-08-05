"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DevProjectFile } from "@/lib/types/dev-types";

interface ImageViewerProps {
  file: DevProjectFile;
  onLoad?: () => void;
}

export function ImageViewer({ file, onLoad }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleImageLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.25, Math.min(5, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
    }
  }, [scale]);

  const handleCopy = useCallback(() => {
    if (file.file_url) {
      navigator.clipboard.writeText(file.file_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [file.file_url]);

  const handleDownload = useCallback(() => {
    if (file.file_url) {
      const link = document.createElement("a");
      link.href = file.file_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [file.file_url, file.name]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="relative h-full bg-[var(--bg)] flex items-center justify-center overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-2 flex flex-col gap-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-xs text-center text-[var(--text)] font-mono">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-full h-px bg-[var(--border-color)] my-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Reset"
          >
            <span className="text-xs">1:1</span>
          </Button>
          
          <div className="w-full h-px bg-[var(--border-color)] my-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Copy link"
          >
            {copied ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imageRef}
          src={file.file_url || ""}
          alt={file.name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "grab",
          }}
          onLoad={handleImageLoad}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-xs text-[var(--text)] opacity-50 hover:opacity-100 transition-opacity">
        Scroll to zoom • Drag to pan • Double-click to reset
      </div>
    </div>
  );
}
