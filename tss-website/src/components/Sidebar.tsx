"use client";

import Link from "next/link";
import Image from "next/image";
import { X, BarChart3, Users, MessageSquare, ChevronRight, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSectionTheme } from "../hooks/use-section-theme";
import { useLanguage } from "../hooks/use-language";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

function SidebarStats({ t }: { t: any }) {
  const [stats, setStats] = useState({ online_users: 0, total_members: 0, messages_today: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        if (data && !data.error) {
          setStats(data);
        }
      } catch (error) {
        console.error("Błąd pobierania statystyk:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="px-4 mb-6">
        <div className="glass rounded-[2rem] p-5 overflow-hidden relative group border border-[var(--border-color)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-general)] opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 text-[var(--text)]">
              <BarChart3 size={12} className="text-[var(--color-general)] shrink-0" /> {t.nav.stats}
            </h2>
            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-[var(--color-general)] animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center border border-[var(--border-color)]">
                  <Users size={14} className="opacity-70 text-[var(--text)]" />
                </div>
                <span className="text-xs font-bold opacity-60 text-[var(--text)]">Społeczność</span>
              </div>
              <span className="text-xs font-black text-[var(--text)]">{(stats.total_members || 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center border border-[var(--border-color)]">
                  <Users size={14} className="opacity-70 text-[var(--text)]" />
                </div>
                <span className="text-xs font-bold opacity-60 text-[var(--text)]">{t.nav.online}</span>
              </div>
              <span className="text-xs font-black text-[var(--text)]">{(stats.online_users || 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center border border-[var(--border-color)]">
                  <MessageSquare size={14} className="opacity-70 text-[var(--text)]" />
                </div>
                <span className="text-xs font-bold opacity-60 text-[var(--text)]">Wiadomości</span>
              </div>
              <span className="text-xs font-black text-[var(--text)]">{(stats.messages_today || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { logo } = useSectionTheme();
  const { t, language, setLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = useMemo(() => [
    {
      id: "home",
      type: "single",
      href: "/",
      label: t.nav.home,
      iconPath: "/assets/Icons/home_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
    },
    {
      id: "profile",
      type: "single",
      href: "/profil",
      label: t.nav.profile,
      iconPath: "/assets/Icons/account_circle_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
    },
    {
      id: "games",
      type: "expandable",
      href: "/games",
      label: t.nav.games,
      iconPath: "/assets/Icons/sports_esports_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
      items: [
        { href: "/games/loucher-gier", label: "Loucher Gier" },
        { href: "/games/info-o-grach", label: "Info o grach" },
      ],
    },
    {
      id: "esport",
      type: "expandable",
      href: "/e-sport",
      label: t.nav.esport,
      iconPath: "/assets/Icons/gamepad_left_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
      items: [
        { href: "/e-sport/szukanie-do-gry", label: "Szukanie do gry" },
        { href: "/e-sport/customy", label: "Customy" },
      ],
    },
    {
      id: "records",
      type: "expandable",
      href: "/records",
      label: t.nav.records,
      iconPath: "/assets/Icons/music_note_2_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
      items: [
        { href: "/records/podcasty", label: "Podcasty" },
        { href: "/records/beaty", label: "Beaty" },
      ],
    },
    {
      id: "dev",
      type: "expandable",
      href: "/dev",
      label: t.nav.dev,
      iconPath: "/assets/Icons/build_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
      items: [
        { href: "/dev/zarzadzanie-ludzmi", label: "Zarządzanie ludźmi" },
        { href: "/dev/white-board", label: "White board" },
        { href: "/dev/taski", label: "Zadania" },
      ],
    },
    {
      id: "notifications",
      type: "single",
      href: "/powiadomienia",
      label: t.nav.notifications,
      iconPath: "/assets/Icons/notifications_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg",
    },
  ], [t]);

  const isPathActive = (href: string) =>
      pathname === href || pathname.startsWith(`${href}/`);

  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSectionId(id);
    }, 450);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSectionId(null);
    }, 100);
  };

  useEffect(() => {
    close();
  }, [pathname, close]);

  const SidebarContent = (
      <div className="flex flex-col h-full py-4">
        {/* Logo Section */}
        <div className="px-6 mb-8 flex items-center justify-center relative">
          <Link href="/" className="block relative group w-full">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-full h-[100px] flex items-center justify-center"
            >
              {mounted && (
                  <Image
                      src={logo}
                      alt="Two Steps Studio Logo"
                      width={180}
                      height={100}
                      className="transition-opacity duration-500 object-contain w-auto h-full max-h-[90px]"
                      unoptimized
                  />
              )}
            </motion.div>
            <div className="absolute inset-0 bg-[var(--color-general)] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity rounded-full" />
          </Link>
          <button
              onClick={close}
              className="lg:hidden absolute right-4 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-[var(--text)]" />
          </button>
        </div>

        <SidebarStats t={t} />

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-6" suppressHydrationWarning>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 px-4 opacity-30 text-[var(--text)]">{t.nav.mainMenu}</h2>
          <ul className="space-y-1">
            {sections.map((section) => {
              if (section.type === "single") {
                const isActive = isPathActive(section.href);
                return (
                    <li key={section.id}>
                      <Link
                          href={section.href}
                          className={cn(
                              "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group overflow-hidden",
                              isActive
                                  ? "text-white"
                                  : "text-[var(--text)]/50 hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
                          )}
                      >
                        {mounted && isActive && (
                            <motion.div
                                layoutId={`active-bg-${section.id}`}
                                className="absolute inset-0 bg-gradient-to-r from-[var(--color-general)] to-[var(--color-records)] shadow-[0_0_20px_rgba(var(--color-general-rgb),0.3)] opacity-90"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                            />
                        )}

                        <div className="relative z-10 flex items-center gap-3 w-full">
                          <div
                              className={cn(
                                  "w-5 h-5 bg-current transition-all duration-300 group-hover:scale-110",
                                  isActive ? "opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-40 group-hover:opacity-100"
                              )}
                              style={{
                                maskImage: `url(${section.iconPath})`,
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                WebkitMaskImage: `url(${section.iconPath})`,
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                              }}
                          />
                          <span className={cn(
                              "text-sm tracking-tight transition-all duration-300",
                              isActive ? "font-black" : "font-bold opacity-60 group-hover:opacity-100"
                          )}>{section.label}</span>
                          {isActive && mounted && (
                              <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="ml-auto"
                              >
                                <ChevronRight size={14} className="opacity-50" />
                              </motion.div>
                          )}
                        </div>
                      </Link>
                    </li>
                );
              }

              const isExpandable = section.type === "expandable";
              const isSectionActive = isExpandable && section.items?.some((i) => isPathActive(i.href));
              const isExpanded = hoveredSectionId === section.id;

              return (
                  <li
                      key={section.id}
                      onMouseEnter={() => handleMouseEnter(section.id)}
                      onMouseLeave={handleMouseLeave}
                  >
                    <div
                        className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group overflow-hidden w-full text-left cursor-pointer",
                            isSectionActive
                                ? "text-white"
                                : "text-[var(--text)]/50 hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                    >
                      {mounted && isSectionActive && (
                          <motion.div
                              layoutId={`active-bg-${section.id}`}
                              className="absolute inset-0 bg-gradient-to-r from-[var(--color-general)] to-[var(--color-records)] shadow-[0_0_20px_rgba(var(--color-general-rgb),0.3)] opacity-90"
                              initial={false}
                              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                          />
                      )}

                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <div
                            className={cn(
                                "w-5 h-5 bg-current transition-all duration-300 group-hover:scale-110",
                                isSectionActive ? "opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-40 group-hover:opacity-100"
                            )}
                            style={{
                              maskImage: `url(${section.iconPath})`,
                              maskSize: "contain",
                              maskRepeat: "no-repeat",
                              WebkitMaskImage: `url(${section.iconPath})`,
                              WebkitMaskSize: "contain",
                              WebkitMaskRepeat: "no-repeat",
                            }}
                        />
                        <span className={cn(
                            "text-sm tracking-tight transition-all duration-300",
                            isSectionActive ? "font-black" : "font-bold opacity-60 group-hover:opacity-100"
                        )}>{section.label}</span>

                        <div className={cn("ml-auto relative z-10 transition-transform duration-200", isExpanded && "rotate-90")}>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                          <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="mt-1 pl-4"
                          >
                            <ul className="space-y-1">
                              {isExpandable && section.items?.map((item) => {
                                const isActive = isPathActive(item.href);
                                return (
                                    <li key={item.href}>
                                      <Link
                                          href={item.href}
                                          className={cn(
                                              "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all relative group overflow-hidden",
                                              isActive
                                                  ? "text-white"
                                                  : "text-[var(--text)]/50 hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
                                          )}
                                      >
                                        {mounted && isActive && (
                                            <motion.div
                                                layoutId={`active-bg-${item.href}`}
                                                className="absolute inset-0 bg-black/10 dark:bg-white/10"
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}

                                        <div className="relative z-10 flex items-center gap-3 w-full pl-3">
                                          <div
                                              className={cn(
                                                  "w-1.5 h-1.5 shrink-0 rounded-full bg-[var(--color-general)] transition-opacity",
                                                  isActive ? "opacity-100" : "opacity-50 group-hover:opacity-70"
                                              )}
                                          />
                                          <span className="text-sm font-bold tracking-tight truncate">
                                    {item.label}
                                  </span>
                                        </div>
                                      </Link>
                                    </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings Footer */}
        <div className="px-4 pt-4 border-t border-[var(--border-color)] space-y-2">
          <div className="flex items-center gap-2 mb-2">
            {mounted && (
                <>
                  {/* Przycisk motywu — używa resolvedTheme dla pewnego odczytu aktualnego motywu */}
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="flex-1 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10 text-[var(--text)]"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                          key={resolvedTheme}
                          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                      >
                        {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                      </motion.div>
                    </AnimatePresence>
                  </Button>

                  {/* Przycisk języka — używa var(--text) zamiast hardcoded text-white */}
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLanguage(language === "pl" ? "en" : "pl")}
                      className="flex-1 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10 font-black text-[10px] text-[var(--text)]"
                  >
                    {language.toUpperCase()}
                  </Button>
                </>
            )}
          </div>

          <Link
              href="/ustawienia"
              className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden border",
                  pathname === "/ustawienia"
                      ? "text-white bg-[var(--color-general)] shadow-lg shadow-[var(--color-general)]/20 font-black border-transparent"
                      : "text-[var(--text)]/50 hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 border-black/10 dark:border-white/10"
              )}
          >
            <div
                className={cn(
                    "w-[18px] h-[18px] bg-current group-hover:rotate-90 transition-transform duration-500 relative z-10",
                    pathname === "/ustawienia" ? "opacity-100" : "opacity-70"
                )}
                style={{
                  maskImage: `url(/assets/Icons/settings_40dp_E3E3E3_FILL0_wght400_GRAD0_opsz40.svg)`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskImage: `url(/assets/Icons/settings_40dp_E3E3E3_FILL0_wght400_GRAD0_opsz40.svg)`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                }}
            />
            <span className="text-sm font-bold tracking-tight relative z-10">{t.nav.settings}</span>
          </Link>
        </div>
      </div>
  );

  return (
      <>
        <aside className="hidden lg:flex w-[240px] bg-[var(--sidebar-bg)] backdrop-blur-3xl border-r border-[var(--border-color)] flex-col fixed inset-y-0 left-0 z-50">
          {SidebarContent}
        </aside>

        <AnimatePresence>
          {isOpen && (
              <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={close}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
                />
                <motion.aside
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed inset-y-0 left-0 w-[300px] bg-[var(--bg)] shadow-2xl z-[101] lg:hidden border-r border-[var(--border-color)]"
                >
                  {SidebarContent}
                </motion.aside>
              </>
          )}
        </AnimatePresence>
      </>
  );
}