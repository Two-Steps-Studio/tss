"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Move,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crosshair,
} from "lucide-react";

interface ReportViewerProps {
  analysis: {
    aim_stats?: Record<string, any>;
    movement_stats?: Record<string, any>;
    positioning_stats?: Record<string, any>;
    decision_stats?: Record<string, any>;
    hotspots?: any[];
    issues_timeline?: any[];
  };
}

export default function ReportViewer({ analysis }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const aimScore = analysis.aim_stats?.accuracy ?? "N/A";
  const movementScore = analysis.movement_stats?.score ?? "N/A";
  const positioningScore = analysis.positioning_stats?.positioning_score ?? "N/A";

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          className="gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Podsumowanie
        </Button>
        <Button
          variant={activeTab === "aim" ? "default" : "outline"}
          onClick={() => setActiveTab("aim")}
          className="gap-2"
        >
          <Crosshair className="w-4 h-4" />
          Aim
        </Button>
        <Button
          variant={activeTab === "movement" ? "default" : "outline"}
          onClick={() => setActiveTab("movement")}
          className="gap-2"
        >
          <Move className="w-4 h-4" />
          Ruch
        </Button>
        <Button
          variant={activeTab === "positioning" ? "default" : "outline"}
          onClick={() => setActiveTab("positioning")}
          className="gap-2"
        >
          <MapPin className="w-4 h-4" />
          Pozycja
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="pt-6">
            <div className="text-sm text-zinc-500 mb-2">Liczba strzelstw</div>
            <div className="text-4xl font-black">{analysis.aim_stats?.shots_count ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="pt-6">
            <div className="text-sm text-zinc-500 mb-2">Średni FPS</div>
            <div className="text-4xl font-black">{analysis.aim_stats?.fps ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="pt-6">
            <div className="text-sm text-zinc-500 mb-2">Reakcja (ms)</div>
            <div className="text-4xl font-black">{analysis.aim_stats?.avg_reaction_time ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Aktywność i strzelania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.hotspots?.map((hotspot, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{hotspot.name || "Hotspot"}</div>
                      <div className="text-sm text-zinc-500">{hotspot.description}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {hotspot.severity || "info"}
                    </Badge>
                  </div>
                  {hotspot.timestamp && (
                    <div className="text-xs text-zinc-400 mt-2">
                      {hotspot.timestamp}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "aim" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-500">Accuracy</div>
              <div className="text-2xl font-black">{aimScore}%</div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[var(--color-general)] rounded-full transition-all"
                style={{ width: `${aimScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "movement" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-500">Movement Score</div>
              <div className="text-2xl font-black">{movementScore}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "positioning" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-500">Positioning Score</div>
              <div className="text-2xl font-black">{positioningScore}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
