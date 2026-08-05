"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Search, WrapText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { DevProjectFile } from "@/lib/types/dev-types";

interface TextViewerProps {
  file: DevProjectFile;
  onLoad?: () => void;
}

export function TextViewer({ file, onLoad }: TextViewerProps) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchText = async () => {
      try {
        if (file.file_url) {
          const response = await fetch(file.file_url);
          const content = await response.text();
          setText(content);
        }
      } catch (error) {
        console.error("Failed to fetch text:", error);
        setText("// Failed to load file content");
      } finally {
        setIsLoading(false);
        onLoad?.();
      }
    };

    fetchText();
  }, [file.file_url, onLoad]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const lines = text.split('\n');
  const highlightedLines = searchQuery
    ? lines.map((line, i) => ({
        line,
        index: i,
        isMatch: line.toLowerCase().includes(searchQuery.toLowerCase())
      }))
    : lines.map((line, i) => ({ line, index: i, isMatch: false }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-dev)] mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading text...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--bg)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {lines.length} lines
          </Badge>
          <Badge variant="outline" className="text-xs">
            {(text.length / 1024).toFixed(2)} KB
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="flex items-center gap-2 mr-2">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 bg-[var(--bg)] border-[var(--border-color)] text-[var(--text)]"
              />
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  {highlightedLines.filter(l => l.isMatch).length} matches
                </Badge>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWrapLines(!wrapLines)}
            className={`text-[var(--text)] hover:bg-[var(--bg)] ${wrapLines ? "bg-[var(--bg)]" : ""}`}
            title="Wrap lines"
          >
            <WrapText className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`text-[var(--text)] hover:bg-[var(--bg)] ${showLineNumbers ? "bg-[var(--bg)]" : ""}`}
            title="Line numbers"
          >
            <span className="text-xs font-mono">#</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-[var(--text)] hover:bg-[var(--bg)]"
            title="Copy text"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 overflow-auto">
        <pre
          className={`p-4 font-mono text-sm text-[var(--text)] ${wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
        >
          {showLineNumbers ? (
            <div className="flex">
              <div className="text-right pr-4 text-muted-foreground select-none border-r border-[var(--border-color)] mr-4">
                {highlightedLines.map(({ index }) => (
                  <div key={index} className="leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                {highlightedLines.map(({ line, index, isMatch }) => (
                  <div
                    key={index}
                    className={`leading-6 ${isMatch ? 'bg-yellow-500/20' : ''}`}
                  >
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            highlightedLines.map(({ line, index, isMatch }) => (
              <div
                key={index}
                className={`leading-6 ${isMatch ? 'bg-yellow-500/20' : ''}`}
              >
                {line || ' '}
              </div>
            ))
          )}
        </pre>
      </div>
    </div>
  );
}
