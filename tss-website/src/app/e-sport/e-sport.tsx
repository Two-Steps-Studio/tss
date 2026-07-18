import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users } from "lucide-react";

export default async function ESportPage() {
  let supabase: any = null;
  let createClientError: Error | null = null;

  try {
    supabase = await createClient();
  } catch (err) {
    createClientError = err as Error;
    console.error('[E-SPORT] Failed to create Supabase client:', createClientError.message);
    return <div className="p-20 text-center">Błąd konfiguracji Supabase</div>;
  }

  if (!supabase) {
    return <div className="p-20 text-center">Błąd konfiguracji Supabase</div>;
  }

  const { data: events, error: eventsError } = await supabase
    .from("e_sport_events")
    .select("*")
    .order("event_date", { ascending: true });

  const teams = [];

  if (eventsError) console.error('[E-SPORT] Error fetching events:', eventsError.message);

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl">
       <div className="relative mb-16 rounded-[2.5rem] overflow-hidden shadow-xl">
          {/* 🖼️ TŁO OBRAZ */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/esport-bg.jpg')" // 👈 wrzuć obraz do /public/images
            }}
          />

          {/* 🌑 OVERLAY (przyciemnienie) */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* 💡 GLOW EFFECT */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-e-sport)]/20 via-transparent to-transparent" />

          {/* ✨ CONTENT */}
          <div className="relative z-10 p-10 md:p-16 text-center">

            <Badge className="mb-4 bg-[var(--color-e-sport)]/20 text-[var(--color-e-sport)] border-0 px-4 py-1.5 rounded-full">
              Two Steps Studio
            </Badge>

            {/* 🔥 GLOW TEXT */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              <span className="block text-white/90">
                TWO STEPS
              </span>

              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-e-sport)] to-pink-500
                drop-shadow-[0_0_20px_var(--color-e-sport)]
                [text-shadow:0_0_30px_var(--color-e-sport)]">
                E-SPORT
              </span>
            </h1>

            <p className="mt-6 text-zinc-300 max-w-2xl mx-auto text-lg">
              Śledź nasze drużyny, turnieje i osiągnięcia. Walczymy o najwyższe cele.
            </p>

          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
                { name: "Szukanie Do Gry", href: "/e-sport/szukanie-do-gry" },
                { name: "Turnieje", href: "/e-sport/turnieje" },
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="rounded-[2rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Drużyny</div>
              <div className="text-3xl font-bold text-black dark:text-white">{teams?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <Trophy className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Turnieje</div>
              <div className="text-3xl font-bold text-black dark:text-white">{events?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
          <CardContent className="p-6 flex items-center gap-4">
            <Calendar className="text-[var(--color-e-sport)]" />
            <div>
              <div className="text-xs uppercase tracking-widest opacity-50 dark:opacity-60">Nadchodzące</div>
              <div className="text-3xl font-bold text-black dark:text-white">
                {(events || []).filter(e => new Date(e.event_date) > new Date()).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams?.map((team) => (
          <Card key={team.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10 hover:border-[var(--color-e-sport)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-e-sport)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-700">
               <Trophy size={120} className="text-[var(--color-e-sport)]" />
            </div>

            <CardHeader className="relative z-10 pb-4">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-2xl font-bold font-[family-name:var(--font-space)] text-black dark:text-white group-hover:text-[var(--color-e-sport)] transition-colors line-clamp-1">
                   {team.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-[var(--color-e-sport)]/10 text-[var(--color-e-sport)] border border-[var(--color-e-sport)]/20 shrink-0">
                   {team.game}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-[family-name:var(--font-outfit)] text-sm">
                 <Calendar size={14} />
                 Założona: <span className="text-zinc-700 dark:text-zinc-200">{team.founded_date || "Nieznana"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 flex-1 flex flex-col justify-between">
              <p className="text-zinc-600 dark:text-zinc-300 font-[family-name:var(--font-outfit)] leading-relaxed line-clamp-3">
                 {team.description}
              </p>
              
              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between">
                 <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">ID: {team.id}</span>
                 <div className="h-8 w-8 rounded-full bg-[var(--color-e-sport)]/10 flex items-center justify-center text-[var(--color-e-sport)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <Trophy size={16} />
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6 font-[family-name:var(--font-space)] text-black dark:text-white">Nadchodzące wydarzenia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(events || []).filter(e => new Date(e.event_date) > new Date()).map((event) => (
            <Card key={event.id} className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-[family-name:var(--font-space)] text-black dark:text-white">
                  <Trophy className="text-[var(--color-e-sport)]" size={20} /> {event.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-[family-name:var(--font-outfit)] text-sm">
                  <Calendar size={14} />
                  {new Date(event.event_date).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-zinc-700 dark:text-zinc-200">{event.description}</p>
                <Button className="rounded-2xl bg-[var(--color-e-sport)] hover:bg-[var(--color-e-sport)]/90 text-white font-bold">
                  WATCH
                </Button>
              </CardContent>
            </Card>
          ))}
          {((events || []).filter(e => new Date(e.event_date) > new Date()).length === 0) && (
            <Card className="rounded-[2rem] bg-white dark:bg-black/40 border-2 border-black dark:border-[var(--color-e-sport)]/10">
              <CardContent className="p-6 text-zinc-600 dark:text-zinc-300">Brak nadchodzących wydarzeń</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
