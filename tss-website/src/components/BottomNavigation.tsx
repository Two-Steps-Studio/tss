"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Gamepad2,
  Trophy,
  Zap,
  MessageSquare,
} from "lucide-react";
import { cn } from "../lib/utils";

const BOTTOM_NAV_ITEMS = {
  home: { label: "Home", href: "/" },
  profile: { label: "Profil", href: "/profil" },
  games: { label: "Gry", href: "/games" },
  esport: { label: "E-sport", href: "/e-sport" },
  records: { label: "Rekordy", href: "/records" },
  dev: { label: "Dev", href: "/dev" },
  notifications: { label: "Powiadomienia", href: "/powiadomienia" },
};

const NAV_ICONS: Record<string, React.ReactNode> = {};

export function BottomNavigation() {
  const pathname = usePathname();

  const getPathColor = (href: string) =>
      pathname === href || pathname.startsWith(`${href}/`)
          ? "var(--color-general)"
          : "rgba(255, 255, 255, 0.5)";

  const getPathScale = (href: string) =>
      pathname === href || pathname.startsWith(`${href}/`)
          ? "scale-125 drop-shadow-[0_0_8px_rgba(var(--color-general-rgb),0.5)]"
          : "scale-100";

  const getIcon = (href: string) => {
    const color = getPathColor(href);
    const scale = getPathScale(href);
    const props = { size: 18, style: { color }, className: cn("transition-all duration-300", scale) };

    switch (href) {
      case "/":            return <Home {...props} />;
      case "/profil":      return <User {...props} />;
      case "/games":       return <Gamepad2 {...props} />;
      case "/e-sport":     return <Zap {...props} />;
      case "/records":     return <Trophy {...props} />;
      case "/dev":         return <Zap {...props} />;
      case "/powiadomienia": return <MessageSquare {...props} />;
      default:             return null;
    }
  };

  const isScrollable = typeof window !== "undefined" && window.innerWidth < 1024;
  if (!isScrollable) return null;

  return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-[1400px] px-4">
          <ul className="flex items-center justify-center gap-0.15 h-16">
            {Object.entries(BOTTOM_NAV_ITEMS).map(([key, item]) => {
              const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                  <li key={key} className="flex-1 max-w-[72px]">
                    <Link
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1.5 py-2 transition-all",
                            isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
                        )}
                    >
                      {getIcon(item.href)}
                      <span className="text-[8px] font-bold text-[var(--text)] text-center leading-none">
                    {item.label}
                  </span>
                    </Link>
                  </li>
              );
            })}
          </ul>
        </div>
      </nav>
  );
}