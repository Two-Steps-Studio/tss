"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Image as ImageIcon, Save } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Ikona Discorda ──────────────────────────────────────────────────────────
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.033.05a19.907 19.907 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// ── Ikona Google ────────────────────────────────────────────────────────────
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function ProfileForm({
  user,
  discordId,
  profile,
  onUpdated,
  onLoginDiscord,
  onLoginGoogle,
}: {
  user: any;
  discordId: string;
  profile: any;
  onUpdated?: (p: { username?: string; avatar_url?: string }) => void;
  onLoginDiscord?: () => void;
  onLoginGoogle?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: discordId,
        username,
        avatar_url: avatarUrl,
        background: profile?.background || "default",
        updated_at: new Date().toISOString(),
      });

    setLoading(false);
    if (!error) {
      onUpdated?.({ username, avatar_url: avatarUrl });
      router.refresh();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg("");

    try {
      await fetch("/api/avatars/ensure", { method: "POST" });
    } catch {}

    const fd = new FormData();
    fd.append("file", file);
    fd.append("userId", discordId);
    fd.append("username", username);

    try {
      const res = await fetch("/api/avatars/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        const filePath = `${discordId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          setErrorMsg(json.error || uploadError.message || "Błąd wgrywania pliku");
        } else {
          const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
          const url = data.publicUrl;
          setAvatarUrl(url);

          await supabase.from("profiles").upsert({
            id: discordId,
            username,
            avatar_url: url,
            background: profile?.background || "default",
            updated_at: new Date().toISOString(),
          });

          onUpdated?.({ username, avatar_url: url });
          window.dispatchEvent(new CustomEvent("profile:updated", { detail: { avatar_url: url, username } }));
          router.refresh();
        }
      } else {
        const url = json.url as string;
        setAvatarUrl(url);
        onUpdated?.({ username, avatar_url: url });
        window.dispatchEvent(new CustomEvent("profile:updated", { detail: { avatar_url: url, username } }));
        router.refresh();
      }
    } catch {
      setErrorMsg("Błąd połączenia podczas wgrywania pliku");
    }

    setUploading(false);
  };

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-general)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative z-10 border-b border-white/5 pb-6">
        <CardTitle className="font-[family-name:var(--font-space)] text-xl flex items-center gap-2">
          <User className="text-[var(--color-general)]" /> Edytuj Profil
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 pt-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-zinc-300 ml-1 font-[family-name:var(--font-outfit)] flex items-center gap-2"
              >
                <User size={14} /> Nazwa Użytkownika
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-[var(--color-general)] focus:ring-[var(--color-general)]/20 transition-all duration-300 h-12"
                placeholder="Wpisz nazwę..."
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="avatarFile"
                className="text-zinc-300 ml-1 font-[family-name:var(--font-outfit)] flex items-center gap-2"
              >
                <ImageIcon size={14} /> Wgraj plik z komputera
              </Label>
              <Input
                id="avatarFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="rounded-2xl border-white/10 bg-white/5 text-white file:text-white file:bg-[var(--color-general)] file:border-0 file:rounded-xl file:px-4 file:py-2 h-12"
              />
              <p className="text-xs text-zinc-500 font-[family-name:var(--font-outfit)]">
                {uploading ? "Wgrywanie..." : "Obsługiwane formaty: JPG, PNG, WEBP"}
              </p>
              {errorMsg && (
                <p className="text-xs text-red-500 font-[family-name:var(--font-outfit)]">{errorMsg}</p>
              )}
            </div>
          </div>

          {/* ── Przyciski społecznościowe ──────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={onLoginDiscord}
              className="flex-1 rounded-2xl h-12 font-bold transition-all duration-300
                         bg-[#5865F2] hover:bg-[#4752C4] text-white
                         shadow-[0_0_20px_-5px_#5865F2] hover:shadow-[0_0_28px_-5px_#5865F2]
                         hover:-translate-y-0.5"
            >
              <DiscordIcon className="mr-2 h-5 w-5" />
              Zaloguj przez Discord
            </Button>

            <Button
              type="button"
              onClick={onLoginGoogle}
              className="flex-1 rounded-2xl h-12 font-bold transition-all duration-300
                         bg-white hover:bg-zinc-100 text-zinc-800
                         shadow-[0_0_20px_-8px_rgba(255,255,255,0.6)] hover:shadow-[0_0_28px_-6px_rgba(255,255,255,0.5)]
                         hover:-translate-y-0.5"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Zaloguj przez Google
            </Button>
          </div>

          {/* ── Przycisk zapisu ───────────────────────────────────────────── */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || uploading}
              className="w-full md:w-auto px-8 rounded-2xl bg-[var(--color-general)] hover:bg-[var(--color-general)]/80 text-white font-bold h-12 transition-all duration-300 shadow-[0_0_20px_-5px_var(--color-general)] hover:shadow-[0_0_25px_-5px_var(--color-general)] hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Zapisz Zmiany
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
