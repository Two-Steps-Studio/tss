import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Calendar, ExternalLink } from "lucide-react";

export default async function SzukanieDoGryPage() {
  const supabase = await createClient();

  // Pobierz wszystkie gry
  const { data: games, error } = await supabase.from("games").select("*").order("id", { ascending: true });

  if (error) {
    console.error('[GAMES] Error fetching data:', error.message);
  }

  // Przykładowe gry do dodania (jeśli baza jest pusta)
  const exampleGames = [
    {
      id: 1,
      name: "Call of Duty: Warzone",
      description: "Odkryj adrenalinową grę wojenną. Walcz w drużynie, zdobywaj kontrakty i stwórz legendę na polu bitwy.",
      category: "Shooter",
    }
  ];

  const allGames = games?.length > 0 ? games : exampleGames;

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
      <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[var(--color-e-sport)]/5 border border-[var(--color-e-sport)]/20 backdrop-blur-md shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-e-sport)]/10 via-transparent to-transparent opacity-60" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-e-sport)]/20 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <Badge className="bg-[var(--color-e-sport)]/20 text-[var(--color-e-sport)] border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
            Gry e-Sport
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white font-[family-name:var(--font-space)] tracking-tight">
            <span className="text-[var(--color-e-sport)]">Szukanie do gry</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
            Znajdź idealną grę do swojej drużyny. Odkryj nowe tytuły i przystąp do wielkich turniejów!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allGames?.map((game) => (
          <Card
            key={game.id}
            className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white/0 dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10 hover:border-[var(--color-e-sport)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-e-sport)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-700">
              <Gamepad2 size={120} className="text-[var(--color-e-sport)]" />
            </div>

            <CardHeader className="relative z-10 pb-4">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-2xl font-bold font-[family-name:var(--font-space)] text-black dark:text-white group-hover:text-[var(--color-e-sport)] transition-colors line-clamp-1">
                  {game.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-[var(--color-e-sport)]/10 text-[var(--color-e-sport)] border border-[var(--color-e-sport)]/20 shrink-0">
                  {game.category}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-[family-name:var(--font-outfit)] text-sm">
                <Calendar size={14} />
                <span className="text-zinc-700 dark:text-zinc-200">Dostępna od premiery</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 flex-1 flex flex-col justify-between">
              <p className="text-zinc-600 dark:text-zinc-300 font-[family-name:var(--font-outfit)] leading-relaxed line-clamp-3">
                {game.description}
              </p>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">ID: {game.id}</span>
                <div className="h-8 w-8 rounded-full bg-[var(--color-e-sport)]/10 flex items-center justify-center text-[var(--color-e-sport)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <Gamepad2 size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statystyki */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] bg-white/0 dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <Gamepad2 className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Gry</div>
              <div className="text-3xl font-bold text-black dark:text-white">{allGames?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] bg-white/0 dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <Trophy className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Turnieje</div>
              <div className="text-3xl font-bold text-black dark:text-white">12</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] bg-white/0 dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <ExternalLink className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Platformy</div>
              <div className="text-3xl font-bold text-black dark:text-white">PC</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] bg-white/0 dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <Calendar className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Aktywność</div>
              <div className="text-3xl font-bold text-black dark:text-white">Wysoka</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

