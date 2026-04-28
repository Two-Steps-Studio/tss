"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Calendar, Plus, RefreshCw, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/games/ui/button";
import { Input } from "@/components/ui/input";

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  async function fetchGames() {
    try {
      const res = await fetch("/api/games/get-all");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd pobierania gier");
      }
      const { data: gamesData } = await res.json();
      setGames(gamesData || []);
    } catch (err) {
      console.error("[GAMES] Error:", err);
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, [reloading]);

  // Filter games based on search term and category
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchTerm, selectedCategory]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(games.map(game => game.category))];
    return ["All", ...uniqueCategories];
  }, [games]);

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
      <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-games)]/20 via-transparent to-transparent opacity-50" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-games)]/20 blur-3xl animate-pulse" />

        <div className="relative z-10 space-y-4">
          <Badge className="bg-[var(--color-games)]/20 text-[var(--color-games)] hover:bg-[var(--color-games)]/30 border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
            Two Steps Studio
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-space)] tracking-tight">
            <span className="text-[var(--color-games)]">Launcher</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
            Odkryj gry w naszym launchera. Dodawaj nowe tytuły bezpośrednio z bazy danych.
          </p>

          <Button
            onClick={() => setReloading(true)}
            disabled={reloading}
            className="mt-4 bg-[var(--color-games)] hover:bg-[var(--color-games)]/90 text-white px-5 py-2 rounded-full font-medium transition-colors"
          >
            <RefreshCw className={reloading ? "animate-spin" : ""} size={16} />
            {reloading ? "Odświeżanie..." : "Odśwież gry"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { name: "Dodać Grę", href: "/games/add-game" },
          { name: "Info o grach", href: "/games/info-o-grach" },
          { name: "All Games", href: "/" },
          { name: "News", href: "/news" },
        ].map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="rounded-3xl border border-[var(--color-games)]/20 bg-[var(--color-games)]/5 hover:bg-[var(--color-games)]/10 transition-all p-5 shadow-sm group"
          >
            <div className="text-lg font-bold text-black dark:text-white group-hover:text-[var(--color-games)] transition-colors flex items-center gap-2">
              {item.name}
            </div>
          </a>
        ))}
      </div>

      <div className="mb-10 p-6 rounded-[2rem] bg-gradient-to-br from-[var(--color-games)]/10 to-transparent border border-[var(--color-games)]/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Dodaj nową grę</h3>
            <p className="text-zinc-400">Użyj panelu administratora lub dodaj demo grę</p>
          </div>
          <Link
            href="/games/add-game"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-games)] hover:bg-[var(--color-games)]/90 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-[var(--color-games)]/25"
          >
            <Plus size={18} />
            Dodać Grę
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 p-6 rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            <Input
              placeholder="Szukaj gier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-games)] focus:border-transparent transition-all appearance-none"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-black/50">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-[var(--color-games)]" size={32} />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 mb-8">
          <strong>Błąd:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames?.map((game) => (
          <Card
            key={game.id}
            className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white/0 dark:bg-black/40 border-2 border-black dark:border-[var(--color-games)]/10 hover:border-[var(--color-games)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-games)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
              <Gamepad2 size={120} className="text-[var(--color-games)]" />
            </div>

            <CardHeader className="relative z-10 pb-4">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-2xl font-bold font-[family-name:var(--font-space)] text-white group-hover:text-[var(--color-games)] transition-colors line-clamp-1">
                  {game.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-[var(--color-games)]/10 text-[var(--color-games)] border border-[var(--color-games)]/20 shrink-0">
                  {game.category}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-zinc-500 font-[family-name:var(--font-outfit)] text-sm">
                <Calendar size={14} />
                <span className="text-zinc-300">Dostępna od premiery</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 flex-1 flex flex-col justify-between">
              <p className="text-zinc-400 font-[family-name:var(--font-outfit)] leading-relaxed line-clamp-3">
                {game.description}
              </p>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-mono uppercase tracking-wider">ID: {game.id}</span>
                <Link
                  href={`/games/${game.id}`}
                  className="h-8 w-8 rounded-full bg-[var(--color-games)]/10 flex items-center justify-center text-[var(--color-games)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                >
                  <Gamepad2 size={16} />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && !error && filteredGames?.length === 0 && (
        <div className="text-center py-20">
          <Gamepad2 size={64} className="mx-auto mb-6 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Brak gier spełniających kryteria</h3>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto">
            Spróbuj zmienić kryteria wyszukiwania lub dodaj pierwszą grę
          </p>
          <Link
            href="/games/add-game"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-games)] hover:bg-[var(--color-games)]/90 text-white rounded-full font-medium transition-colors shadow-lg"
          >
            <Plus size={18} />
            Dodaj Grę
          </Link>
        </div>
      )}
    </div>
  );
}