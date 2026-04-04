"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "next-themes";
import { useColorTheme } from "@/hooks/use-color-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sun, Moon, MonitorSmartphone, Languages, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Prefs = {
  animations: boolean;
  sounds: boolean;
  quality: boolean;
  notif_news: boolean;
  notif_esport: boolean;
  notif_dev: boolean;
};

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme: appearance, setTheme, resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const { theme: colorTheme, setTheme: setColorTheme } = useColorTheme();
  const [prefs, setPrefs] = useState<Prefs>({
    animations: true,
    sounds: false,
    quality: true,
    notif_news: true,
    notif_esport: true,
    notif_dev: true,
  });

  useEffect(() => {
    const p = {
      animations: localStorage.getItem("ui-animations") !== "off",
      sounds: localStorage.getItem("ui-sounds") === "on",
      quality: localStorage.getItem("ui-quality") !== "low",
      notif_news: localStorage.getItem("notif-news") !== "off",
      notif_esport: localStorage.getItem("notif-esport") !== "off",
      notif_dev: localStorage.getItem("notif-dev") !== "off",
    };
    setPrefs(p);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").select("settings").eq("id", user.id).single().then(({ data }) => {
          if (data && data.settings) {
            const s = data.settings;
            setPrefs(prev => ({
              animations: s.animations ?? prev.animations,
              sounds: s.sounds ?? prev.sounds,
              quality: s.quality ?? prev.quality,
              notif_news: s.notif_news ?? prev.notif_news,
              notif_esport: s.notif_esport ?? prev.notif_esport,
              notif_dev: s.notif_dev ?? prev.notif_dev,
            }));
            if (s.animations !== undefined) localStorage.setItem("ui-animations", s.animations ? "on" : "off");
            if (s.sounds !== undefined) localStorage.setItem("ui-sounds", s.sounds ? "on" : "off");
            if (s.quality !== undefined) localStorage.setItem("ui-quality", s.quality ? "high" : "low");
            if (s.notif_news !== undefined) localStorage.setItem("notif-news", s.notif_news ? "on" : "off");
            if (s.notif_esport !== undefined) localStorage.setItem("notif-esport", s.notif_esport ? "on" : "off");
            if (s.notif_dev !== undefined) localStorage.setItem("notif-dev", s.notif_dev ? "on" : "off");
          }
        });
      }
    });
  }, []);

  const setPref = async (key: keyof Prefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    if (key === "animations") localStorage.setItem("ui-animations", value ? "on" : "off");
    if (key === "sounds") localStorage.setItem("ui-sounds", value ? "on" : "off");
    if (key === "quality") localStorage.setItem("ui-quality", value ? "high" : "low");
    if (key === "notif_news") localStorage.setItem("notif-news", value ? "on" : "off");
    if (key === "notif_esport") localStorage.setItem("notif-esport", value ? "on" : "off");
    if (key === "notif_dev") localStorage.setItem("notif-dev", value ? "on" : "off");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("settings").eq("id", user.id).single();
      const currentSettings = data?.settings || {};
      const newSettings = { ...currentSettings, [key]: value };
      await supabase.from("profiles").update({ settings: newSettings }).eq("id", user.id);
    }
  };

  const AppearanceOption = ({ value, icon: Icon, label }: { value: "light" | "dark" | "system"; icon: any; label: string }) => (
    <button
      onClick={() => setTheme(value)}
      className={`${appearance === value ? "bg-[var(--color-general)]/10 border-[var(--color-general)]" : `${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}
    >
      <Icon className="text-[var(--color-general)] shrink-0 size-8" />
      <div className="text-center mt-1">
        <div className="text-sm font-black">{label}</div>
        {value === "light" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Pełne światło</div>}
        {value === "dark" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Komfort oczu</div>}
        {value === "system" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Zgodnie z sys.</div>}
      </div>
      {appearance === value && (
        <div className="absolute top-3 right-3">
          <Check size={16} className="text-[var(--color-general)] shrink-0" />
        </div>
      )}
    </button>
  );

  const ColorChip = ({ value, label, className }: { value: "ocean" | "crimson" | "emerald" | "violet" | "amber"; label: string; className?: string }) => {
    const isDark = resolvedTheme === "dark";
    return (
      <button
        onClick={() => setColorTheme(value)}
        className={`${className || ""} ${colorTheme === value ? "bg-[var(--color-general)]/10 border-[var(--color-general)]" : (isDark ? "bg-[var(--bg)]/50 border-[var(--border-color)]" : "bg-neutral-100/80 border-neutral-200")}`}
      >
        <span className="w-6 h-6 shrink-0 rounded-full" style={{ background: "currentColor" }} />
        <div className="text-left overflow-hidden">
          <div className="text-sm font-bold truncate">{label}</div>
        </div>
        {colorTheme === value && <Check size={16} className="ml-auto text-[var(--color-general)] shrink-0" />}
      </button>
    );
  };

  return (
    <div className={`container mx-auto p-6 mt-20 max-w-7xl transition-colors ${!darkMode ? 'bg-[var(--bg)]' : ''}`}>
      <div className="relative overflow-hidden rounded-[2.5rem] glass p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] font-[family-name:var(--font-space)]">USTAWIENIA</h1>
            <p className={`mt-2 font-[family-name:var(--font-outfit)] ${!darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.settings.subtitle}</p>
          </div>
          <Badge className="bg-[var(--color-general)]/15 text-[var(--color-general)] px-4 py-2 rounded-2xl border-0">Twoja sesja</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <Card className="rounded-[2.5rem] glass">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">{t.settings.appearance}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppearanceOption value="light" icon={Sun} label={t.settings.light} />
            <AppearanceOption value="dark" icon={Moon} label={t.settings.dark} />
            <AppearanceOption value="system" icon={MonitorSmartphone} label={t.settings.system} />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">{t.settings.language}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage("pl")}
              className={`flex items-center gap-3 px-5 py-6 rounded-2xl border transition-all ${language === "pl" ? "bg-[var(--color-general)]/10 border-[var(--color-general)]" : `${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}
            >
              <Languages className="text-[var(--color-general)]" />
              <div>
                <div className="text-lg font-black">PL</div>
                <div className="text-xs opacity-60">POLSKI</div>
              </div>
              {language === "pl" && <Check size={16} className="ml-auto text-[var(--color-general)]" />}
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-3 px-5 py-6 rounded-2xl border transition-all ${language === "en" ? "bg-[var(--color-general)]/10 border-[var(--color-general)]" : `${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}
            >
              <Languages className="text-[var(--color-general)]" />
              <div>
                <div className="text-lg font-black">US</div>
                <div className="text-xs opacity-60">ENGLISH</div>
              </div>
              {language === "en" && <Check size={16} className="ml-auto text-[var(--color-general)]" />}
            </button>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">{t.settings.colorTheme}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorChip value="ocean" label={t.settings.themes.default} />
            <ColorChip value="crimson" label="Cyberpunk" />
            <ColorChip value="emerald" label="Nature" />
            <ColorChip value="violet" label="Midnight" />
            <ColorChip value="amber" label="Gold" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 items-start">
        <Card className="rounded-[2.5rem] glass">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">Interfejs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-colors ${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}>
              <div className="font-medium">Animacje</div>
              <Switch checked={prefs.animations} onCheckedChange={(v) => setPref("animations", v)} />
            </div>
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-colors ${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}>
              <div className="font-medium">Dźwięki UI</div>
              <Switch checked={prefs.sounds} onCheckedChange={(v) => setPref("sounds", v)} />
            </div>
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-colors ${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}>
              <div className="font-medium">Wysoka jakość</div>
              <Switch checked={prefs.quality} onCheckedChange={(v) => setPref("quality", v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-[var(--text)]">{t.settings.notifications}</CardTitle>
            <Badge className="bg-[var(--color-general)]/15 text-[var(--color-general)] px-3 py-1 rounded-2xl border-0">Bezpieczne dane</Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-3xl border p-6 space-y-2 transition-colors ${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}>
              <div className="text-sm font-black">{t.settings.news}</div>
              <div className="text-xs opacity-60">{t.settings.newsDesc}</div>
              <div className="pt-2">
                <Switch checked={prefs.notif_news} onCheckedChange={(v) => setPref("notif_news", v)} />
              </div>
            </div>
            <div className={`rounded-3xl border p-6 space-y-2 transition-colors ${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}>
              <div className="text-sm font-black">{t.settings.esport}</div>
              <div className="text-xs opacity-60">{t.settings.esportDesc}</div>
              <div className="pt-2">
                <Switch checked={prefs.notif_esport} onCheckedChange={(v) => setPref("notif_esport", v)} />
              </div>
            </div>
            <div className={`rounded-3xl border p-6 space-y-2 transition-colors ${!darkMode ? 'bg-neutral-100/80 border-neutral-200' : 'bg-[var(--bg)]/50 border-[var(--border-color)]'}`}>
              <div className="text-sm font-black">{t.settings.dev}</div>
              <div className="text-xs opacity-60">{t.settings.devDesc}</div>
              <div className="pt-2">
                <Switch checked={prefs.notif_dev} onCheckedChange={(v) => setPref("notif_dev", v)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
