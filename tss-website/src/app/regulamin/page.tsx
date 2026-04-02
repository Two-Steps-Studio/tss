"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, User, Shield, FileText, CheckCircle2 } from "lucide-react";

export default function RegulaminPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleAccept = async () => {
    try {
      localStorage.setItem("termsAccepted", "true");
      localStorage.setItem("termsAcceptedDate", new Date().toISOString());
      toast.success(t.regulamin.accepted);
    } catch (err) {
      toast.error(t.regulamin.acceptError);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-4xl glass rounded-[2.5rem] shadow-2xl overflow-hidden relative border-black/10 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-general)]/10 via-transparent to-transparent opacity-50" />
        <CardHeader className="text-center space-y-4 relative z-10">
          <FileText className="w-16 h-16 mx-auto text-[var(--color-general)] opacity-80" />
          <CardTitle className="text-3xl font-bold text-center">{t.regulamin.title}</CardTitle>
          <CardDescription className="text-center max-w-2xl mx-auto">
            {t.regulamin.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-8">
          <div className="prose prose-zinc max-w-none text-zinc-600 dark:text-zinc-400 font-[family-name:var(--font-outfit)] leading-relaxed">
            <section className="scroll-mt-16">
              <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-general)] text-white">1</span>
                Cel Regulaminu
              </h2>
              <p className="text-sm leading-relaxed">
                Regulamin ma na celu zapewnienie bezpiecznego i przyjemnego doświadczenia dla wszystkich użytkowników Two Steps Studio.
              </p>
            </section>

            <section className="scroll-mt-16">
              <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-general)] text-white">2</span>
                Zakazane Działania
              </h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Społeczne i agresywne zachowania</li>
                <li>Podawanie fałszywych danych</li>
                <li>Używanie programów pomocniczych do oszukiwania w grach</li>
                <li>Podważanie wiarygodności Two Steps Studio</li>
                <li>Naruszenie praw autorskich</li>
              </ul>
            </section>

            <section className="scroll-mt-16">
              <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-general)] text-white">3</span>
                Współpraca z Discordem
              </h2>
              <p className="text-sm leading-relaxed">
                Do korzystania z pełnej funkcjonalności Two Steps Studio, musisz połączyć swoje konto z Discordem.
                Zabezpieczamy Twoje dane i never share them with third parties.
              </p>
            </section>

            <section className="scroll-mt-16">
              <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-general)] text-white">4</span>
                Naruszenie
              </h2>
              <p className="text-sm leading-relaxed">
                Naruszenie regulaminu może prowadzić do zakazania dostępu do serwisu i usunięcia konta.
              </p>
            </section>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t border-white/10">
            <Button
              onClick={handleAccept}
              className="gap-2 bg-[var(--color-general)] hover:bg-[var(--color-general)]/80 text-white font-bold h-12 rounded-2xl"
            >
              <CheckCircle2 className="h-4 w-4" />
              Akceptuję regulamin
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/rejestracja")}
              className="h-12 rounded-2xl border-black/10 dark:border-white/10 font-bold"
            >
              Powrót do rejestracji
            </Button>
          </div>
        </CardContent>
        <div className="text-center text-xs text-zinc-500 px-4 pb-4 font-mono opacity-50">
          Last updated: 2026-04-02
        </div>
      </Card>
    </div>
  );
}
