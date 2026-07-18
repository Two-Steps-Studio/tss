"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Calendar, ArrowLeft, Star, Users, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameCategoryCard } from "@/components/game-category-card";

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params using React.use() to avoid deprecation warning
  const unwrappedParams = use(params);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch("/api/games/get-all");
        if (!res.ok) {
          throw new Error("Błąd pobierania danych gry");
        }
        const { data } = await res.json();

        // Find the specific game by ID
        const foundGame = data.find((g: any) => g.id === parseInt(unwrappedParams.id));
        if (!foundGame) {
          throw new Error("Gra nie została znaleziona");
        }

        setGame(foundGame);
      } catch (err) {
        console.error("[GAME DETAIL] Error:", err);
        setError(err instanceof Error ? err.message : "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 mt-20 max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-games)]"></div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto p-6 mt-20 max-w-7xl">
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 mb-8">
          <strong>Błąd:</strong> {error || "Gra nie została znaleziona"}
        </div>
        <Link href="/games" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-games)] hover:bg-[var(--color-games)]/90 text-white rounded-full font-medium transition-colors shadow-lg">
          <ArrowLeft size={18} />
          Wróć do launchera
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
      <div className="mb-8">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-[var(--color-games)] hover:text-[var(--color-games)]/80 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Wróć do launchera</span>
        </Link>
      </div>

      <div className="relative mb-12 p-8 rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-games)]/20 via-transparent to-transparent opacity-50" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-games)]/20 blur-3xl animate-pulse" />

        <div className="relative z-10 space-y-4">
          <Badge className="bg-[var(--color-games)]/20 text-[var(--color-games)] hover:bg-[var(--color-games)]/30 border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
            Two Steps Studio
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-space)] tracking-tight">
            <span className="text-[var(--color-games)]">{game.name}</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Opis gry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 leading-relaxed">
                {game.description}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8 bg-white/5 border-white/10 rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Szczegóły</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[var(--color-games)]" size={20} />
                  <span className="text-zinc-300">Data premiery: {game.release_date || "N/D"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="text-[var(--color-games)]" size={20} />
                  <span className="text-zinc-300">Kategoria: {game.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-[var(--color-games)]" size={20} />
                  <span className="text-zinc-300">Graczy: 1245</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-[var(--color-games)]" size={20} />
                  <span className="text-zinc-300">Czas gry: 42h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full bg-[var(--color-games)] hover:bg-[var(--color-games)]/90 text-white rounded-full font-medium transition-colors">
                  Rozpocznij grę
                </Button>
                <Button variant="outline" className="w-full border-[var(--color-games)]/30 text-[var(--color-games)] hover:bg-[var(--color-games)]/10 rounded-full font-medium transition-colors">
                  Dodaj do ulubionych
                </Button>
                <Button variant="outline" className="w-full border-[var(--color-games)]/30 text-[var(--color-games)] hover:bg-[var(--color-games)]/10 rounded-full font-medium transition-colors">
                  Pobierz wersję testową
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8 bg-white/5 border-white/10 rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Informacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">ID gry:</span>
                  <span className="text-white font-mono">{game.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Kategoria:</span>
                  <span className="text-white">{game.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Data premiery:</span>
                  <span className="text-white">{game.release_date || "N/D"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status:</span>
                  <span className="text-green-400">Dostępna</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}