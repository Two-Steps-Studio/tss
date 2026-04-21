import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Monitor } from "lucide-react";

const exampleGames = [
  {
    id: 1,
    name: "Call of Duty: Warzone",
    description: "Odkryj adrenalinową grę wojenną. Walcz w drużynie, zdobywaj kontrakty i stwórz legendę na polu bitwy.",
    category: "Shooter",
  }
];

export default async function CustomyPage() {
  const supabase = await createClient();
  const { data: games, error } = await supabase.from("games").select("*").order("id", { ascending: true });

  if (error) {
    console.error('[CUSTOMY] Error fetching games:', error.message);
  }

  const allGames = games?.length > 0 ? games : exampleGames;

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
      <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[var(--color-e-sport)]/5 border border-[var(--color-e-sport)]/20 backdrop-blur-md shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-e-sport)]/10 via-transparent to-transparent opacity-60" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-e-sport)]/20 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <Badge className="bg-[var(--color-e-sport)]/20 text-[var(--color-e-sport)] border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
            Drużynowa
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white font-[family-name:var(--font-space)] tracking-tight">
            <span className="text-[var(--color-e-sport)]">Turnieje</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
            Gry dostępne dla drużyny Two Steps Studio. Dołącz do naszej społeczności e-sportowej!
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { name: "E-Sport", href: "/e-sport" },
          { name: "Szukanie Do Gry", href: "/e-sport/szukanie-do-gry" },
        ].map((item, i) => (
            <a
                key={i}
                href={item.href}
                className="rounded-3xl border border-[var(--color-e-sport)]/20 bg-[var(--color-e-sport)]/5 hover:bg-[var(--color-e-sport)]/10 transition-all p-5 shadow-sm group"
            >
              <div className="text-lg font-bold text-black dark:text-white group-hover:text-[var(--color-e-sport)] transition-colors">
                {item.name}
              </div>
            </a>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {allGames.map((game) => (
          <Card
            key={game.id}
            className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10 hover:border-[var(--color-e-sport)] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-e-sport)]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-[family-name:var(--font-space)] text-black dark:text-white">
                {game.name}
              </CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-300">
                {game.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {game.description}
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10 flex gap-2">
                <Badge variant="secondary" className="bg-[var(--color-e-sport)]/10 text-[var(--color-e-sport)]">
                  {game.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
