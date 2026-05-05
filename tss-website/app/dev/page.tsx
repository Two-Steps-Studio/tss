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
