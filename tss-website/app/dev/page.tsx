"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevHomePage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/0 dark:bg-black/40 border-2 border-[var(--color-dev)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-[var(--color-dev)]/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-dev)]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 19.92 12 17.01 5.82 19.92 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-black text-[var(--color-dev)]">DEV MODE</CardTitle>
          <p className="text-zinc-400 text-sm">
            Tryb deweloperski jest obecnie włączony
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-[var(--color-dev)]/5 border border-[var(--color-dev)]/20">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Posiudasz dostęp do wszystkich funkcji deweloperskich.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
