"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Image as ImageIcon, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileForm({
                                      user,
                                      discordId,   // ← NOWY PROP: zawsze provider_id z Discorda
                                      profile,
                                      onUpdated,
                                    }: {
  user: any;
  discordId: string;
  profile: any;
  onUpdated?: (p: { username?: string; avatar_url?: string }) => void;
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

    // ── KLUCZ: używamy discordId zamiast user.id ──
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
    fd.append("userId", discordId);  // ← discordId zamiast user.id
    fd.append("username", username);

    try {
      const res = await fetch("/api/avatars/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        // Fallback: bezpośredni upload do Supabase Storage
        const filePath = `${discordId}/${Date.now()}-${file.name}`;  // ← discordId
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
            id: discordId,  // ← discordId
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
    } catch (err: any) {
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
                <Label htmlFor="username" className="text-zinc-300 ml-1 font-[family-name:var(--font-outfit)] flex items-center gap-2">
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
                <Label htmlFor="avatarFile" className="text-zinc-300 ml-1 font-[family-name:var(--font-outfit)] flex items-center gap-2">
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
                {errorMsg && <p className="text-xs text-red-500 font-[family-name:var(--font-outfit)]">{errorMsg}</p>}
              </div>
            </div>

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