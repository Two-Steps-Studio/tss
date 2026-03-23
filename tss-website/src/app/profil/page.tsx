"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileForm from "./profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Trophy, Star, Bell, Lock, CreditCard } from "lucide-react";
import LogoutButton from "./logout-button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

 export default function ProfilePage() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [user, setUser] = useState<any>(null);
   const [profile, setProfile] = useState<any>(null);
   const [weeklyXP, setWeeklyXP] = useState(0);
   const [authChecked, setAuthChecked] = useState(false);

  const displayName = (p: any, u: any) => {
    const emailName = (u?.email ?? "").split("@")[0] || "";
    return p?.username || u?.user_metadata?.full_name || emailName;
  };

   useEffect(() => {
     const load = async () => {
        // Wait for OAuth state to settle if needed
        if (typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
            await new Promise(r => setTimeout(r, 1500));
        }

       const { data: { user } } = await supabase.auth.getUser();
       setAuthChecked(true);

       if (!user) {
         if (!window.location.search.includes('code=')) {
            router.push("/login");
         }
         return;
       }
       
       setUser(user);
       const { data: profile } = await supabase
         .from("profiles")
         .select("*")
         .eq("id", user.id)
         .maybeSingle(); 
       setProfile(profile);
       
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
   }, [router]);

   if (!authChecked || (loading && !user)) {
     return (
       <div className="container mx-auto p-6 space-y-8 mt-20 max-w-6xl">
         <Card className="relative overflow-hidden rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl shadow-xl">
           <CardContent className="p-12 text-center">
             <div className="flex flex-col items-center gap-4">
                <div className="h-40 w-40 bg-white/10 rounded-full animate-pulse" />
                <div className="h-6 w-48 bg-white/10 rounded-xl animate-pulse" />
                <p className="text-zinc-500 font-medium">Wczytywanie profilu Two Steps Studio...</p>
             </div>
           </CardContent>
         </Card>
       </div>
     );
   }

   if (!user && !window.location.search.includes('code=')) {
       return null; 
   }

   const xp = profile?.xp || 0;
   const level = profile?.level || 1;
   const nextLevelXp = level * 1000;
   const progress = Math.min((xp / nextLevelXp) * 100, 100);
   const rank = level >= 20 ? "Elite" : level >= 10 ? "Pro" : level >= 5 ? "Intermediate" : "Novice";

   return (
    <div className="container mx-auto p-6 space-y-8 mt-20 max-w-6xl" suppressHydrationWarning>
      <Card className="relative overflow-hidden rounded-[2.5rem] border border-white/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.3)]">
         <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-general)]/15 via-transparent to-transparent opacity-90 dark:opacity-70" />
         <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-general)]/25 blur-3xl" />
         
         <CardContent className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[var(--color-general)] to-transparent opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500" />
                  <Avatar className="h-40 w-40 ring-4 ring-[var(--color-general)]/20 border-2 border-[var(--color-general)]/30 shadow-xl transition-transform duration-500 group-hover:scale-105 bg-white dark:bg-transparent">
                    <AvatarImage
                      src={profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || (user?.user_metadata as any)?.picture || undefined}
                      alt={profile?.username || user?.email}
                    />
                    <AvatarFallback className="text-4xl bg-white text-black font-[family-name:var(--font-space)]">
                      {(profile?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 px-3 py-1 bg-[var(--color-general)] border-white/10 shadow-lg text-white font-bold rounded-full">
                    Lvl {level}
                  </Badge>
               </div>
               
               <div className="text-center md:text-left space-y-4 flex-1">
                  <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-space)] tracking-tight">
                      {displayName(profile, user)}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-300 font-[family-name:var(--font-outfit)]">
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:border-[var(--color-general)] transition-colors">
                       <Mail size={14} /> {user?.email}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user?.id);
                        toast.success("Skopiowano ID użytkownika");
                      }}
                      className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:border-[var(--color-general)] transition-colors"
                    >
                      <Shield size={14} /> ID: {user?.id?.slice(0, 8)}...
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[var(--color-general)]/20 text-[var(--color-general)] border-white/10">Ranga: {rank}</Badge>
                      <Badge className="bg-[var(--color-dev)]/20 text-[var(--color-dev)] border-white/10">Weekly +{weeklyXP} XP</Badge>
                    </div>
                  </div>

                  {/* Sync Ranks Section */}
                  {profile?.discord_roles && profile.discord_roles.length > 0 && (
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 animate-in fade-in slide-in-from-left-4 duration-700">
                        {profile.discord_roles.map((role: string) => (
                          <Badge 
                            key={role} 
                            variant="secondary"
                            className="bg-black/20 text-white/70 border-white/5 backdrop-blur-md rounded-lg hover:bg-[var(--color-general)]/20 hover:text-white transition-all font-bold px-3 py-1 text-[10px] tracking-wider uppercase"
                          >
                            {role}
                          </Badge>
                        ))}
                     </div>
                  )}
               </div>

               <div className="w-full md:w-72 space-y-3 bg-white/80 dark:bg-white/5 p-5 rounded-2xl border border-[var(--color-general)]/15 dark:border-white/10 backdrop-blur-sm hover:border-[var(--color-general)]/40 transition-colors shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-bold flex items-center gap-2"><Trophy size={14} className="text-[var(--color-general)]" /> Postęp Poziomu</span>
                    <span className="font-black text-[var(--color-general)]">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2.5 rounded-full bg-[var(--color-general)]/10" />
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-black opacity-40">
                    <span>{xp} XP</span>
                    <span>{nextLevelXp} XP</span>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[2.5rem] border border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-xl">
               <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 italic">
                    <Star className="text-[var(--color-general)]" /> Twoje Statystyki
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                     <span className="text-sm font-bold opacity-60">Portfel</span>
                     <span className="text-xl font-black text-[var(--color-general)]">{profile?.money || 0} TSS</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                     <span className="text-sm font-bold opacity-60">W banku</span>
                     <span className="text-xl font-black text-[var(--color-records)]">{profile?.bank || 0} TSS</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                     <span className="text-sm font-bold opacity-60">Aktywność</span>
                     <span className="text-sm font-black uppercase tracking-widest">Wysoka</span>
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-xl">
               <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 italic">
                    <Lock className="text-[var(--color-general)]" /> Bezpieczeństwo
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="space-y-4">
                     <LogoutButton />
                  </div>
               </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[2.5rem] border border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-xl">
               <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 italic">
                    <Bell className="text-[var(--color-general)]" /> Ustawienia Profilu
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <ProfileForm user={user} profile={profile} onUpdated={(p) => setProfile({...profile, ...p})} />
               </CardContent>
            </Card>
        </div>
      </div>
    </div>
   );
 }
