"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileForm from "./profile-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Trophy, Star, Bell } from "lucide-react";
import LogoutButton from "./logout-button";
import { toast } from "sonner";
import Image from "next/image";

// ── ROLE Z PRIORYTETEM (kolejność = ważność, im niższy index tym ważniejsza) ──
// Role leveli są celowo POMINIĘTE — nie wyświetlamy ich
const ROLE_PRIORITY: Array<{ key: string; color: string; label: string }> = [
    // Staff
    { key: "〔 👑︱Owner 〕",                         color: "#dc3545", label: "OWNER" },
    { key: "〔 👑︱Owner Records 〕",                  color: "#9b59b6", label: "OWNER RECORDS" },
    { key: "〔 👑︱ Co-Owner Games 〕",                color: "#3cd5d3", label: "CO-OWNER GAMES" },
    { key: "〔 🛡️︱Administrator 〕",                 color: "#f6db6f", label: "ADMIN" },
    { key: "〔 🌐︱Moderator 〕",                      color: "#2da4f3", label: "MOD" },
    { key: "〔 💜︱Server Booster 〕",                 color: "#a61cb3", label: "BOOSTER" },
    // VIP
    { key: "〔 🦣 ︱ MVIP〕",                         color: "#ee1616", label: "MVIP" },
    { key: "〔 🐄 ︱ SVIP〕",                         color: "#cea009", label: "SVIP" },
    { key: "〔 🐨 ︱ VIP〕",                          color: "#a7b11a", label: "VIP" },
    // Records
    { key: "〔 🎙️︱Wykonawca 〕",                    color: "#c8a800", label: "EXEC" },
    { key: "〔 💽︱Producent 〕",                      color: "#e09000", label: "PROD" },
    // Marketing
    { key: "〔 📢︱Główny Marketingowiec 〕",          color: "#e81313", label: "HEAD MKT" },
    { key: "〔 📢︱Marketingowiec 〕",                 color: "#e81313", label: "MKT" },
    // Dev
    { key: "〔 💻︱Główny Programista 〕",             color: "#00bcd4", label: "HEAD DEV" },
    { key: "〔 💻︱Programista 〕",                    color: "#2979ff", label: "DEV" },
    // Level Design
    { key: "〔 🗺️︱Główny Projektantant Poziomów 〕", color: "#43a047", label: "HEAD LD" },
    { key: "〔 🗺️︱Projektantant Poziomów 〕",        color: "#43a047", label: "LD" },
    // 2D
    { key: "〔 🎨︱Główny Artysta 2D 〕",             color: "#8d4e1a", label: "HEAD 2D" },
    { key: "〔 🎨︱Artysta 2D 〕",                    color: "#e07820", label: "2D" },
    // 3D
    { key: "〔 🧱︱ Główny Artysta 3D 〕",            color: "#8d4e1a", label: "HEAD 3D" },
    { key: "〔 🧱︱Artysta 3D 〕",                    color: "#e07820", label: "3D" },
    // VFX
    { key: "〔✨︱Główny Artysta Efektów 〕",          color: "#d4c400", label: "HEAD VFX" },
    { key: "〔✨︱Artysta Efektów 〕",                 color: "#d4c400", label: "VFX" },
    // SFX
    { key: "〔 🎧︱Główny Dzwiękowiec 〕",            color: "#9e9e9e", label: "HEAD SFX" },
    { key: "〔 🎧︱Dzwiękowiec 〕",                   color: "#9e9e9e", label: "SFX" },
    // Animatorzy
    { key: "〔 🕺︱Główny Animator  〕",              color: "#1565c0", label: "HEAD ANIM" },
    { key: "〔 🕺︱ Animator  〕",                    color: "#2979ff", label: "ANIM" },
    // QA
    { key: "〔 🎮︱ Główny Tester  〕",               color: "#9c27b0", label: "HEAD QA" },
    { key: "〔 🎮︱Tester  〕",                       color: "#ce93d8", label: "QA" },
    // E-Sport
    { key: "〔 💀︱ Call Of Duty 〕",                 color: "#607d8b", label: "COD" },
    // Levele — CELOWO POMINIĘTE (nie pokazujemy)
];

// Mapa key → {priority, color, label}
const ROLE_MAP = new Map(
    ROLE_PRIORITY.map((r, i) => [r.key.trim(), { priority: i, color: r.color, label: r.label }])
);

// Fuzzy lookup: trim + dopasowanie po fragmencie między ︱ a 〕
function findRole(raw: string) {
    const t = raw.trim();
    if (ROLE_MAP.has(t)) return ROLE_MAP.get(t)!;
    for (const [key, val] of ROLE_MAP) {
        if (key === t) return val;
    }
    const inner = raw.match(/︱\s*(.+?)\s*〕/)?.[1]?.trim().toLowerCase();
    if (inner) {
        for (const [key, val] of ROLE_MAP) {
            const ki = key.match(/︱\s*(.+?)\s*〕/)?.[1]?.trim().toLowerCase();
            if (ki && ki === inner) return val;
        }
    }
    return null; // nieznana lub level — ignorujemy
}

// ── DISCORD ROLES PANEL ──────────────────────────────────────────────────────
function DiscordRolesPanel({ discordRoles }: { discordRoles: string[] }) {
    // Dopasuj tylko znane ważne role (levele = null → odfiltrowane)
    const matched = discordRoles
        .map((raw) => ({ raw, info: findRole(raw) }))
        .filter((x): x is { raw: string; info: { priority: number; color: string; label: string } } => x.info !== null)
        // Sortuj według priorytetu (niższy index = ważniejsza)
        .sort((a, b) => a.info.priority - b.info.priority);

    if (matched.length === 0) return null;

    return (
        <div className="space-y-2 pt-1">
            <p className="text-[10px] uppercase tracking-[0.14em] font-black text-white/35 select-none">
                Role — {matched.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
                {matched.map(({ raw, info }) => (
                    <span
                        key={raw}
                        title={raw}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-semibold border cursor-default select-none transition-all duration-150 hover:brightness-125"
                        style={{
                            color: info.color,
                            borderColor: `${info.color}55`,
                            backgroundColor: `${info.color}1a`,
                        }}
                    >
                        <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: info.color }}
                        />
                        {info.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

// MAPOWANIE RANG dla głównego badge'a na avatarze
const DISCORD_ROLES_BADGE: Record<string, { color: string; label: string }> = Object.fromEntries(
    ROLE_PRIORITY.map((r) => [r.key, { color: r.color, label: r.label }])
);

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [weeklyXP, setWeeklyXP] = useState(0);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        let channel: any;

        const load = async () => {
            if (typeof window !== "undefined" && (window.location.hash || window.location.search.includes("code="))) {
                await new Promise((r) => setTimeout(r, 1500));
            }

            const { data: { user } } = await supabase.auth.getUser();
            setAuthChecked(true);

            if (!user) {
                if (!window.location.search.includes("code=")) router.push("/login");
                return;
            }

            setUser(user);

            const discordId = user.user_metadata?.provider_id || user.id;

            const { data: initialProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", discordId)
                .maybeSingle();

            setProfile(initialProfile || { xp: 0, money: 0, bank: 0, level: 1, rank: "", discord_roles: [] });

            channel = supabase
                .channel(`profile-${discordId}`)
                .on("postgres_changes", {
                    event: "*",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${discordId}`,
                }, (payload) => {
                    setProfile(payload.new);
                })
                .subscribe();

            const weekThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: weeklyPresence } = await supabase
                .from("site_presence")
                .select("session_id", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gte("seen_at", weekThreshold);
            setWeeklyXP(weeklyPresence || 0);
            setLoading(false);
        };

        load();
        return () => { if (channel) supabase.removeChannel(channel); };
    }, [router]);

    if (!authChecked || (loading && !user)) {
        return <div className="p-20 text-center text-white italic">Wczytywanie...</div>;
    }

    const roleInfo = DISCORD_ROLES_BADGE[profile?.rank] || { color: "var(--color-general)", label: `LEVEL ${profile?.level || 1}` };
    const discordName = user?.user_metadata?.global_name || user?.user_metadata?.full_name || user?.email?.split("@")[0];
    const xp = profile?.xp || 0;
    const level = profile?.level || 1;
    const nextLevelXp = level * 1000;
    const progress = Math.min((xp / nextLevelXp) * 100, 100);

    const discordRoles: string[] = Array.isArray(profile?.discord_roles) ? profile.discord_roles : [];

    return (
        <div className="container mx-auto p-6 space-y-8 mt-20 max-w-6xl" suppressHydrationWarning>

            {/* ── KARTA GŁÓWNA ── */}
            <Card className="relative overflow-hidden rounded-[2.5rem] border border-white/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-general)]/15 via-transparent to-transparent opacity-90 dark:opacity-70" />

                <CardContent className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">

                        {/* Avatar */}
                        <div className="relative group flex-shrink-0">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[var(--color-general)] to-transparent opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500" />
                            <Avatar className="h-40 w-40 ring-4 ring-[var(--color-general)]/20 border-2 border-[var(--color-general)]/30 shadow-xl transition-transform duration-500 group-hover:scale-105 bg-white dark:bg-transparent">
                                <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
                                <AvatarFallback className="text-4xl bg-white text-black">
                                    {discordName?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Badge
                                className="absolute -bottom-2 -right-2 px-3 py-1 border-white/10 shadow-lg text-white font-bold rounded-full transition-colors duration-500"
                                style={{ backgroundColor: roleInfo.color }}
                            >
                                {roleInfo.label}
                            </Badge>
                        </div>

                        {/* Nazwa + mail + ID + ROLE */}
                        <div className="text-center md:text-left space-y-3 flex-1 min-w-0">
                            <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-space)] tracking-tight">
                                {discordName}
                            </h1>

                            {/* Mail / ID / Weekly */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-zinc-300 font-[family-name:var(--font-outfit)]">
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:border-[var(--color-general)] transition-colors text-sm">
                                    <Mail size={13} /> {user?.email}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-sm">
                                    <Shield size={13} /> ID: {(user?.user_metadata?.provider_id || user?.id)?.slice(0, 8)}...
                                </span>
                                <Badge className="bg-[var(--color-dev)]/20 text-[var(--color-dev)] border-white/10 text-xs">
                                    Weekly +{weeklyXP} XP
                                </Badge>
                            </div>

                            {/* ── ROLE — posortowane, bez leveli ── */}
                            <DiscordRolesPanel discordRoles={discordRoles} />
                        </div>

                        {/* Postęp poziomu */}
                        <div className="w-full md:w-72 flex-shrink-0 space-y-3 bg-white/80 dark:bg-white/5 p-5 rounded-2xl border border-[var(--color-general)]/15 dark:border-white/10 backdrop-blur-sm shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-bold flex items-center gap-2 text-white">
                                    <Trophy size={14} className="text-[var(--color-general)]" /> Postęp Poziomu
                                </span>
                                <span className="font-black text-[var(--color-general)]">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2.5 rounded-full bg-[var(--color-general)]/10" />
                            <div className="flex justify-between text-[10px] uppercase tracking-widest font-black opacity-40 text-white">
                                <span>{xp} XP</span>
                                <span>{nextLevelXp} XP</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── DOLNA SIATKA ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-xl">
                        <CardHeader className="border-b border-white/5 pb-4 text-white font-bold italic">
                            <Star className="mr-2 text-[var(--color-general)]" /> Twoje Statystyki
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                                <span className="text-sm font-bold opacity-60 text-white">Portfel</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-[var(--color-general)]">{profile?.money || 0}</span>
                                    <Image src="/assets/discord/coin/Coin_TSS.png" alt="C" width={24} height={24} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                                <span className="text-sm font-bold opacity-60 text-white">Bank</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-[var(--color-records)]">{profile?.bank || 0}</span>
                                    <Image src="/assets/discord/coin/Coin_TSS.png" alt="C" width={24} height={24} className="opacity-80" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <LogoutButton />
                </div>

                <div className="lg:col-span-8">
                    <Card className="rounded-[2.5rem] border border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl">
                        <CardHeader className="border-b border-white/5 pb-4 text-white font-bold italic">
                            <Bell className="mr-2 text-[var(--color-general)]" /> Ustawienia Profilu
                        </CardHeader>
                        <CardContent className="p-8">
                            <ProfileForm user={user} profile={profile} onUpdated={(p) => setProfile({ ...profile, ...p })} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}