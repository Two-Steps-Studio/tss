"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";

interface ProfileBannerProps {
  userId: string;
  username?: string;
  currentBanner: string | null;
}

export function ProfileBanner({ userId, currentBanner }: Pick<ProfileBannerProps, 'userId' | 'currentBanner'>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(currentBanner || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Minimalny rozmiar banera (1000x500) - można to dostosować w CSS
  const MIN_BANNER_SIZE = { width: 1000, height: 500 };

  useEffect(() => {
    if (!bannerUrl && currentBanner?.length > 0) {
      fetch(currentBanner).catch(console.error);
    }
  }, [currentBanner]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Tylko pliki graficzne są dozwolone");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Maksymalny rozmiar to 15MB");
      return;
    }

    setUploading(true);
    setError(null);

    // Tymczasowy podgląd z lokalnego URL
    const localPreview = URL.createObjectURL(file);
    setBannerUrl(localPreview);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("userId", userId.toString());

      const res = await fetch("/api/banners/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        // Fallback — direct upload do prywatnego bucketa z signed URL
        const path = `banners/${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

        if (uploadError) {
          setError(json.error || uploadError.message);
          setBannerUrl(currentBanner || null);
          return;
        }

        const urlData = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365).then(r => r.data) as any | undefined;

        if (urlData?.signedUrl) {
          setBannerUrl(urlData.signedUrl);

          // Save to database - use direct service key upload since we're in server context or have access through API handler
          await supabase.from("profiles").upsert({ id: userId, background: urlData.signedUrl });

          window.dispatchEvent(new CustomEvent("profile-banner-ready", { detail: { background: urlData.signedUrl } }));
        } else {
          setError("Nie udało się wygenerować URL obrazu");
          setBannerUrl(currentBanner || null);
        }
      } else if (json.url) {
        // Use the public API response - save it to DB for next page load and consistency
        await supabase.from("profiles").upsert({ id: userId, background: json.url });

        window.dispatchEvent(new CustomEvent("profile-banner-ready", { detail: { background: json.url } }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd połączenia");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview); // Always revoke the object URL to avoid memory leak even if upload fails
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !error) handleFile(file);
  };

  const removeBackground = async () => {
    await supabase.from("profiles").update({ background: null }).eq('id', userId).then(() => {}); // Ignore errors, user already sees UI change
    setBannerUrl(null);
    window.dispatchEvent(new CustomEvent("profile-banner-ready", { detail: { background: null } }));
  };

  return (
    <div className="relative">
      {/* Tło banera */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-[2rem] transition-all duration-300 ${dragOver ? "scale-[1.01]" : ""}`}
        style={{
          minWidth: `${MIN_BANNER_SIZE.width}px`,
          minHeight: `${MIN_BANNER_SIZE.height}px`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#eee" // Fallback when no banner yet for better UX while editing profile form on same page load
        }} as any>

        {/* Gradient overlay dla czytelności tekstu nad tłem */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent" />

        {!bannerUrl && (
          <div className="relative h-full flex items-center justify-center text-zinc-300 gap-2 p-6">
            <Upload size={32} className="opacity-40 mb-2" />
            <p className="text-sm font-bold text-white/75 max-w-md text-center leading-relaxed">Kliknij lub przeciągnij obraz tutaj</p>
          </div>
        )}

      </div>

      {/* Kontener treści - renderowany NAD tłem dzięki z-10 */}
      <div className="relative z-[2] p-6 space-y-3">

        {error && (
          <div className="absolute top-4 left-4 right-0 p-2 bg-red-500/90 text-white text-xs font-bold rounded-xl backdrop-blur-sm border-l-2 border-red-400 max-w-fit">{error}</div>
        )}

        {/* Ukryty input do uploadu */}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e: any) => { const file = e.target.files?.[0]; if (file && !error) handleFile(file); }} />

      </div>

      {/* Kontrola usuwania banera */}
      <Button
        type="button"
        variant="outline"
        onClick={removeBackground}
        className={`absolute top-4 right-3 px-2.5 py-1 rounded-lg text-xs backdrop-blur-[8px] border ${!bannerUrl || uploading ? "opacity-0 hover:opacity-60 pointer-events-none" : ""}`}
      >
        Usuń tło
      </Button>

    </div>
  );
}
