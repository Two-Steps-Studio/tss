"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, User as UserIcon, Menu, Bell, Search, Command, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSidebar } from "@/hooks/use-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/lib/supabase";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { toggle } = useSidebar();
  const { t, language, setLanguage } = useLanguage();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const c = Number(localStorage.getItem("notif_unread_count") || "0");
      setUnread(Number.isFinite(c) ? c : 0);
    };
    updateCount();
    const handler = (e: any) => {
      const d = e?.detail || {};
      if (typeof d.count === "number") setUnread(d.count);
    };
    window.addEventListener("notifications:count", handler as any);
    window.addEventListener("storage", updateCount as any);
    return () => {
      window.removeEventListener("notifications:count", handler as any);
      window.removeEventListener("storage", updateCount as any);
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const emailName = (user.email ?? "").split("@")[0] || "";
      setDisplayName(user.user_metadata?.full_name || emailName);
      const metaAvatar = (user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture || null;
      if (metaAvatar) setAvatarUrl(metaAvatar);
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url,username,pln_balance")
        .eq("id", user.id)
        .single();
      setAvatarUrl(data?.avatar_url ?? metaAvatar ?? null);
      setDisplayName((data?.username as string) || user.user_metadata?.full_name || emailName);
      if (data?.pln_balance) {
        localStorage.setItem("pln_balance", String(data.pln_balance));
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    const handler = (e: any) => {
      const d = e?.detail || {};
      if (d.avatar_url) setAvatarUrl(d.avatar_url);
      if (d.username) setDisplayName(d.username);
      if (d.pln_balance !== undefined) {
        localStorage.setItem("pln_balance", String(d.pln_balance));
      }
    };
    window.addEventListener("profile:updated", handler as any);
    return () => {
      window.removeEventListener("profile:updated", handler as any);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload: any) => {
          const row = payload.new || payload.old || {};
          if (row.avatar_url) setAvatarUrl(row.avatar_url);
          if (row.username) setDisplayName(row.username);
          if (row.pln_balance !== undefined) {
            localStorage.setItem("pln_balance", String(row.pln_balance));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  return (
    <header className={cn(
      "fixed top-0 right-0 left-0 lg:left-[240px] z-[40] transition-all duration-500 px-4 pt-4",
      isScrolled ? "h-[70px]" : "h-[80px]"
    )}>
      <div className={cn(
        "h-full w-full glass rounded-3xl px-4 md:px-6 flex items-center justify-between transition-all duration-500",
        isScrolled ? "shadow-2xl shadow-black/10 translate-y-[-4px]" : ""
      )}>
        {/* Left Side: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={toggle} 
            className="lg:hidden p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:flex items-center relative max-w-md w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[var(--color-general)]" size={18} />
            <input 
              type="text" 
              placeholder={t.nav.searchPlaceholder} 
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl py-2.5 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-[var(--color-general)]/20 transition-all outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 border border-white/5 opacity-50 group-focus-within:opacity-100 transition-opacity">
              <Command size={10} className="font-bold" />
              <span className="text-[10px] font-black">K</span>
            </div>
          </div>
        </div>
      
        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "pl" ? "en" : "pl")}
                className="rounded-2xl w-11 h-11 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-none transition-all hover:scale-105 active:scale-95 text-sm font-black"
              >
                {language.toUpperCase()}
              </Button>
            )}

            <Link href="/powiadomienia">
              <Button variant="ghost" size="icon" className="rounded-2xl w-11 h-11 relative bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-none transition-all hover:scale-105 active:scale-95">
                <Bell size={20} />
                {unread > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[var(--color-general)] text-white text-[10px] font-black flex items-center justify-center border-2 border-[var(--bg)]">
                    {unread}
                  </span>
                ) : (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-[var(--color-general)] rounded-full border-2 border-[var(--bg)] opacity-60" />
                )}
              </Button>
            </Link>
          
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-2xl w-11 h-11 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-none transition-all hover:scale-105 active:scale-95"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            )}
          </div>

          <div className="w-px h-8 bg-[var(--border-color)] mx-1" />

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <Link href="/profil">
                <motion.div
                  whileHover={{ scale: 1.05, borderColor: "var(--color-general)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-full border-2 border-[var(--border-color)] overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/5 cursor-pointer transition-all relative group"
                >
                  <Avatar className="w-11 h-11">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Avatar" onError={() => setAvatarUrl(null)} />
                    ) : (
                      <AvatarFallback className="uppercase font-bold">
                        {(displayName?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 bg-[var(--color-general)] opacity-0 group-hover:opacity-10 transition-opacity" />
                </motion.div>
              </Link>

              {/* Balans PLN - każdy użytkownik ma własny balans */}
              <div className="flex flex-col items-end ml-2">
                <span className="text-xs text-muted-foreground font-medium">PLN</span>
                <span className="text-sm font-black text-[var(--color-general)]">
                  {(localStorage.getItem("pln_balance") || "0,00").toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="rounded-2xl h-11 px-4 border-white/10 hover:bg-white/5 font-bold flex items-center gap-2">
                <LogIn size={18} />
                <span className="hidden sm:inline">{t.nav.login}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
