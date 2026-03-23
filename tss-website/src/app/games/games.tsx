import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Calendar } from "lucide-react";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase.from("games").select("*");

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
       {/* Hero Section */}
       <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-games)]/20 via-transparent to-transparent opacity-50" />
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-games)]/20 blur-3xl animate-pulse" />
          
          <div className="relative z-10 space-y-4">
             <Badge className="bg-[var(--color-games)]/20 text-[var(--color-games)] hover:bg-[var(--color-games)]/30 border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
                Two Steps Studio
             </Badge>
             <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-space)] tracking-tight">
                Nasze <span className="text-[var(--color-games)]">Gry</span>
             </h1>
             <p className="text-zinc-400 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
                Odkryj światy, które tworzymy. Od epickich przygód po szybkie rozgrywki – znajdź coś dla siebie.
             </p>
          </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games?.map((game) => (
          <Card key={game.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-black/40 border border-white/10 hover:border-[var(--color-games)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
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
                 Data wydania: <span className="text-zinc-300">{game.release_date || "Wkrótce"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 flex-1 flex flex-col justify-between">
              <p className="text-zinc-400 font-[family-name:var(--font-outfit)] leading-relaxed line-clamp-3">
                 {game.description}
              </p>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                 <span className="text-xs text-zinc-600 font-mono uppercase tracking-wider">ID: {game.id}</span>
                 <div className="h-8 w-8 rounded-full bg-[var(--color-games)]/10 flex items-center justify-center text-[var(--color-games)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <Gamepad2 size={16} />
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
