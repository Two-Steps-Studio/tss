"use client";

import { useEffect, useState } from "react";
import { useDevSettings } from "@/hooks/use-dev-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function DevHomePage() {
  const { isDevEnabled, devCode, setIsDevEnabled, setDevCode } = useDevSettings();
  const [localCode, setLocalCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const checkDevAccess = async () => {
    if (!localCode.trim()) return;
    setChecking(true);
    setError("");

    const savedCode = localStorage.getItem("dev-access-code") || devCode;

    if (savedCode === localCode) {
      setIsDevEnabled(true);
      setDevCode(localCode);
      localStorage.setItem("dev-access-code", localCode);
      localStorage.removeItem("dev-access-code-timestamp");
      setLocalCode("");
      setError("");
    } else {
      const now = Date.now();
      const expired = localStorage.getItem("dev-access-code-timestamp");
      const expiryTime = parseInt(expired || "0") + 15 * 60 * 1000; // 15 minut

      if (now < expiryTime) {
        setError("Nieprawidłowy kod dostępowy");
        setLocalCode("");
      } else {
        localStorage.removeItem("dev-access-code");
        localStorage.removeItem("dev-access-code-timestamp");
        setIsDevEnabled(false);
        setDevCode(null);
        setError("Kod wygasł - proszę ponownie podać kod dostępowy");
        setLocalCode("");
      }
    }
    setChecking(false);
  };

  // Cleanup expired codes
  useEffect(() => {
    const cleanupExpiredCodes = () => {
      const now = Date.now();
      const expired = localStorage.getItem("dev-access-code-timestamp");
      if (expired) {
        const expiryTime = parseInt(expired) + 15 * 60 * 1000;
        if (now >= expiryTime) {
          localStorage.removeItem("dev-access-code");
          localStorage.removeItem("dev-access-code-timestamp");
          setIsDevEnabled(false);
          setDevCode(null);
        }
      }
    };

    cleanupExpiredCodes();
    const interval = setInterval(cleanupExpiredCodes, 60000);

    return () => clearInterval(interval);
  }, [setIsDevEnabled, setDevCode]);

  // Sprawdź czy kod był wpisany wcześniej (z sesji)
  useEffect(() => {
    if (!isDevEnabled) {
      const now = Date.now();
      const expired = localStorage.getItem("dev-access-code-timestamp");
      if (expired) {
        const expiryTime = parseInt(expired) + 15 * 60 * 1000;
        if (now < expiryTime && !error) {
          const code = localStorage.getItem("dev-access-code");
          if (code) {
            setIsDevEnabled(true);
            setDevCode(code);
            localStorage.removeItem("dev-access-code-timestamp");
          }
        }
      }
    }
  }, [isDevEnabled, setIsDevEnabled, setDevCode, error]);

    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto p-6 mt-20 max-w-7xl">
          <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[var(--color-dev)]/5 border border-[var(--color-dev)]/20 backdrop-blur-md shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dev)]/10 via-transparent to-transparent opacity-60" />
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-dev)]/20 blur-3xl" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex bg-[var(--color-dev)]/20 text-[var(--color-dev)] px-4 py-1.5 text-sm font-medium rounded-full">
                Two Steps Studio
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white tracking-tight">
                <span className="text-[var(--color-dev)]">DEV</span>
              </h1>

              <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl text-lg md:text-xl leading-relaxed">
                Zarządzaj zadaniami, ludźmi, notatkami i postępem projektów w jednym miejscu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { name: "Managment", href: "/dev/managment" },
              { name: "Tasks", href: "/dev/tasks" },
              { name: "White-board", href: "/dev/white-board" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="rounded-3xl border border-[var(--color-dev)]/20 bg-[var(--color-dev)]/5 hover:bg-[var(--color-dev)]/10 transition-all p-5 shadow-sm group"
              >
                <div className="text-lg font-bold text-black dark:text-white group-hover:text-[var(--color-dev)] transition-colors">
                  {item.name}
                </div>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Zadania</h2>
              <div className="space-y-4">
                {tasks.map((task, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{task.title}</span>
                      <span>{task.status}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                      <div className="h-full bg-[var(--color-dev)] rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Szybkie notatki</h2>
              <textarea
                placeholder="Zapisz ważne info dla zespołu..."
                className="w-full h-64 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-4 outline-none"
              />
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Statystyki</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Aktywne projekty</p>
                  <p className="text-3xl font-bold">4</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Członkowie teamu</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Taski ukończone</p>
                  <p className="text-3xl font-bold">86%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/0 dark:bg-black/40 border-2 border-red-500">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-500/10">
              <Lock className="text-red-500" size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-black text-red-500">DEV MODE</CardTitle>
          <p className="text-zinc-400 text-sm">
            Tryb deweloperski jest obecnie wyłączony. Wprowadź kod dostępowy aby uzyskać dostęp.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Kod dostępowy</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={localCode}
                onChange={(e) => setLocalCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkDevAccess()}
                disabled={checking}
                className="flex-1 px-4 py-3 rounded-xl border border-red-500/30 bg-black/50 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                placeholder="Wpisz kod..."
              />
              <button
                onClick={checkDevAccess}
                disabled={!localCode.trim() || checking}
                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-500/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enter
              </button>
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <p className="text-xs text-zinc-500 text-center">
              Kod zostanie zapisany na 15 minut
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
