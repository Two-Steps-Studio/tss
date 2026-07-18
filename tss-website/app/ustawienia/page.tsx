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
import { setNotifStorage, setUiStorage } from "@/lib/storage";
import { getThemeSelectedClass, getThemeUnselectedClass } from "@/lib/theme-utilities";

type Prefs = {
  animations: boolean;
  sounds: boolean;
  quality: boolean;
  notif_news: boolean;
  notif_esport: boolean;
  notif_dev: boolean;
  dev_mode: boolean;
  dev_access_code: string | null;
};

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme: appearance, setTheme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<string>("light");
  useEffect(() => {
    setResolvedTheme(typeof window !== "undefined" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : "light");
  }, []);
  const darkMode = resolvedTheme === "dark";
  const { theme: colorTheme, setTheme: setColorTheme } = useColorTheme();
  const [prefs, setPrefs] = useState<Prefs>(() => ({
    animations: true,
    sounds: false,
    quality: true,
    notif_news: true,
    notif_esport: true,
    notif_dev: true,
  }));

  const autoFillCode = (waitForInput = false) => {
    const code = localStorage.getItem("dev-access-code");
    if (code && prefs.dev_mode) {
      // Automatycznie wpisz kod gdy jest zapisany i DEV jest włączone
      setTimeout(() => {
        if (typeof document !== "undefined") {
          const input = document.querySelector('input[type="password"]');
          if (input && prefs.dev_access_code !== code) {
            // Synchronizuj tylko jeśli kod się zmienił
            const newValue = code;
            if (input.value !== newValue) {
              setPrefs(prev => ({ ...prev, dev_access_code: newValue }));
              // Automatycznie wypełnij input
              input.value = newValue;
            }
          }
        }
      }, waitForInput ? 300 : 0);
    }
  };

  useEffect(() => {
    const loadLocalStorage = (): Prefs => ({
      animations: localStorage.getItem("ui-animations") !== "off",
      sounds: localStorage.getItem("ui-sounds") === "on",
      quality: localStorage.getItem("ui-quality") !== "low",
      notif_news: localStorage.getItem("notif-news") !== "off",
      notif_esport: localStorage.getItem("notif-esport") !== "off",
      notif_dev: localStorage.getItem("notif-dev") !== "off",
      dev_mode: localStorage.getItem("dev-mode") === "on",
      dev_access_code: localStorage.getItem("dev-access-code") || null,
    });

    (async () => {
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (!user) {
        // Bez logowania - DEV domyślnie wyłączone
        localStorage.setItem("dev-mode", "off");
        localStorage.removeItem("dev-access-code");
        setPrefs(prev => ({ ...prev, dev_mode: false, dev_access_code: null }));
        autoFillCode();
        return;
      }

      const currentPrefs = loadLocalStorage();

      // Jeśli DEV jest włączone, automatycznie załaduj kod
      if (currentPrefs.dev_mode && !currentPrefs.dev_access_code) {
        currentPrefs.dev_access_code = localStorage.getItem("dev-access-code");
      }

      const profileDataResult = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      const profileData = profileDataResult.data;

      if (profileData?.settings) {
        currentPrefs = {
          ...currentPrefs,
          dev_mode: profileData.settings.dev_mode ?? currentPrefs.dev_mode,
          dev_access_code: profileData.settings.dev_access_code ?? currentPrefs.dev_access_code,
        };
      }

      setPrefs(currentPrefs);
      setUiStorage("animations", profileData?.settings?.animations);
      setUiStorage("sounds", profileData?.settings?.sounds);
      setUiStorage("quality", profileData?.settings?.quality);
      setNotifStorage("notif_news", profileData?.settings?.notif_news);
      setNotifStorage("notif_esport", profileData?.settings?.notif_esport);
      setNotifStorage("notif_dev", profileData?.settings?.notif_dev);
      setUiStorage("dev_mode", currentPrefs.dev_mode);
      setUiStorage("dev_access_code", currentPrefs.dev_access_code);
    })();
  }, []);

  // Automatycznie synchronizuj kod dostępowy z delayem
  useEffect(() => {
    autoFillCode(true);
  }, [prefs.dev_mode]);

  const getThemeColor = () => colorTheme === "ocean" ? "var(--color-general)" :
    colorTheme === "crimson" ? "var(--color-records)" :
    colorTheme === "emerald" ? "var(--color-esports)" :
    colorTheme === "violet" ? "var(--color-primary)" : "var(--color-general)";

  const setPref = async (key: keyof Prefs, value: string | boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setNotifStorage("notif_news", value);
    setNotifStorage("notif_esport", value);
    setNotifStorage("notif_dev", value);
    setUiStorage("animations", value);
    setUiStorage("sounds", value);
    setUiStorage("quality", value);
    localStorage.setItem("dev-mode", value ? "on" : "off");
    if (key === "dev_access_code") {
      if (value) {
        // Zapisuj kod tylko jeśli nie jest pusty
        localStorage.setItem("dev-access-code", value);
      } else {
        localStorage.removeItem("dev-access-code");
      }
    }
  };

  const AppearanceOption = ({ value, icon: Icon, label }: { value: "light" | "dark" | "system"; icon: any; label: string }) => {
    return (
      <button
        onClick={() => setTheme(value)}
        className={`${getThemeUnselectedClass()} ${getThemeSelectedClass(darkMode)}`}
      >
        <Icon className="text-[var(--color-general)] shrink-0 size-8" />
        <div className="text-center mt-1">
          <div className="text-sm font-black">{label}</div>
          {value === "light" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Pełne światło</div>}
          {value === "dark" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Komfort oczu</div>}
          {value === "system" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Zgodnie z sys.</div>}
        </div>
      </button>
    );
  };

  const ColorChip = ({ value, label, className }: { value: "ocean" | "crimson" | "emerald" | "violet" | "amber"; label: string; className?: string }) => {
    const isSelected = colorTheme === value;
    const themeColor = getThemeColor();
    return (
      <button
        onClick={() => setColorTheme(value)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isSelected ? "bg-white/10 border-[var(--color-general)]" : "bg-[var(--bg)]/50 border-[var(--border-color)]"}`}
      >
        <span className={`w-6 h-6 shrink-0 rounded-full ${isSelected ? "" : "bg-white/20"}`} style={{ background: `var(--${value}-theme-color, currentColor)` }} />
        <div className="text-left overflow-hidden">
          <div className="text-sm font-bold truncate">{label}</div>
          {isSelected && <Check size={16} className="text-[var(--color-general)] ml-auto" />}
        </div>
      </button>
    );
  };

  const themeColor = getThemeColor();

  return (
    <div className="container mx-auto p-6 mt-20 max-w-7xl transition-colors">
      <div className="relative overflow-hidden rounded-[2.5rem] glass p-8 border-2 border-[var(--color-general)]/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] font-[family-name:var(--font-space)]">USTAWIENIA</h1>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-zinc-400">{t.settings.subtitle}</p>
          </div>
          <Badge className={`bg-[${themeColor}]/15 text-[${themeColor}] px-4 py-2 rounded-2xl border-0`}>Twoja sesja</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">{t.settings.appearance}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AppearanceOption value="light" icon={Sun} label={t.settings.light} />
            <AppearanceOption value="dark" icon={Moon} label={t.settings.dark} />
            <AppearanceOption value="system" icon={MonitorSmartphone} label={t.settings.system} />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">{t.settings.language}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage("pl")}
              className={`flex items-center gap-3 px-5 py-6 rounded-2xl border transition-all ${language === "pl" ? `bg-[${themeColor}]/15 border-[${themeColor}]` : "bg-[var(--bg)]/50 border-[var(--border-color)]"}`}
            >
              <Languages className="text-[var(--color-general)]" />
              <div>
                <div className="text-lg font-black">PL</div>
                <div className="text-xs opacity-60">POLSKI</div>
              </div>
              {language === "pl" && <Check size={16} className="text-[var(--color-general)] ml-auto" />}
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-3 px-5 py-6 rounded-2xl border transition-all ${language === "en" ? `bg-[${themeColor}]/15 border-[${themeColor}]` : "bg-[var(--bg)]/50 border-[var(--border-color)]"}`}
            >
              <Languages className="text-[var(--color-general)]" />
              <div>
                <div className="text-lg font-black">US</div>
                <div className="text-xs opacity-60">ENGLISH</div>
              </div>
              {language === "en" && <Check size={16} className="text-[var(--color-general)] ml-auto" />}
            </button>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">{t.settings.colorTheme}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <ColorChip value="ocean" label={t.settings.themes.default} />
            <ColorChip value="crimson" label="Cyberpunk" />
            <ColorChip value="emerald" label="Nature" />
            <ColorChip value="violet" label="Midnight" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 items-start">
        <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
          <CardHeader>
            <CardTitle className="text-[var(--text)]">Interfejs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
              <div className="font-medium">Animacje</div>
              <Switch checked={prefs.animations} onCheckedChange={(v) => setPref("animations", v)} />
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
              <div className="font-medium">Dźwięki UI</div>
              <Switch checked={prefs.sounds} onCheckedChange={(v) => setPref("sounds", v)} />
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
              <div className="font-medium">Wysoka jakość</div>
              <Switch checked={prefs.quality} onCheckedChange={(v) => setPref("quality", v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-[var(--text)]">{t.settings.notifications}</CardTitle>
            <Badge className="bg-[var(--color-general)]/15 text-[var(--color-general)] px-3 py-1 rounded-2xl border-0">Bezpieczne dane</Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border p-6 space-y-2 bg-[var(--bg)]/50 border-[var(--border-color)]">
              <div className="text-sm font-black">{t.settings.news}</div>
              <div className="text-xs opacity-60">{t.settings.newsDesc}</div>
              <div className="pt-2">
                <Switch checked={prefs.notif_news} onCheckedChange={(v) => setPref("notif_news", v)} />
              </div>
            </div>
            <div className="rounded-3xl border p-6 space-y-2 transition-colors bg-[var(--bg)]/50 border-[var(--border-color)]">
              <div className="text-sm font-black">{t.settings.esport}</div>
              <div className="text-xs opacity-60">{t.settings.esportDesc}</div>
              <div className="pt-2">
                <Switch checked={prefs.notif_esport} onCheckedChange={(v) => setPref("notif_esport", v)} />
              </div>
            </div>
            <div className="rounded-3xl border p-6 space-y-2 transition-colors bg-[var(--bg)]/50 border-[var(--border-color)]">
              <div className="text-sm font-black">{t.settings.dev}</div>
              <div className="text-xs opacity-60">{t.settings.devDesc}</div>
              <div className="pt-2">
                <Switch checked={prefs.notif_dev} onCheckedChange={(v) => setPref("notif_dev", v)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] glass lg:col-span-2 border-2 border-[var(--color-general)]/30 bg-[var(--color-general)]/5 dark:bg-[var(--color-general)]/10">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-[var(--text)] font-black">DEV MODE</CardTitle>
            <Badge className={`${prefs.dev_mode ? `bg-[${themeColor}]` : "bg-zinc-500"} text-white px-3 py-1 rounded-2xl border-0`}>
              {prefs.dev_mode ? "WŁĄCZONY" : "WYŁĄCZONY"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
              <div className="font-medium">Tryb deweloperski</div>
              <Switch
                checked={prefs.dev_mode}
                onCheckedChange={(v) => setPref("dev_mode", v)}
              />
            </div>

            {prefs.dev_mode && (
              <div className="space-y-3 p-4 rounded-2xl border border-[var(--color-general)]/30 bg-[var(--color-general)]/10">
                <div className="text-sm font-bold">Kod dostępowy do DEV</div>
                <div className="text-xs opacity-70">
                  Wpisz kod dostępowy aby wejść do trybu DEV. Kod zostanie zapisany w przeglądarce na 15 minut.
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Wpisz kod..."
                    className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-black/50 text-white placeholder:text-zinc-400/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-general)] font-mono text-sm"
                    value={prefs.dev_access_code ?? ""}
                    onChange={(e) => setPref("dev_access_code", e.target.value)}
                  />
                  <Button
                    onClick={() => setPref("dev_access_code", prefs.dev_access_code)}
                    variant="outline"
                    className="px-4 py-3 border-[var(--color-general)]/30 text-[var(--color-general)] hover:bg-[var(--color-general)]/20"
                  >
                    Zapisz
                  </Button>
                </div>
                {prefs.dev_access_code && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400/80 px-2 py-1 rounded">
                    <span className="font-mono bg-[var(--color-general)]/20 px-2 py-1 rounded">Zapisany kod:</span>
                    <span className="font-mono font-bold">{prefs.dev_access_code}</span>
                    <span className="opacity-60">· (ważny na 15 min)</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-10">
          <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
            <CardContent className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Wersja aplikacji</span>
                  <span className="text-2xl font-black font-mono text-[var(--text)]">
            Beta{" "}
                    <span className="text-[var(--color-general)]">0.1</span>
          </span>
                </div>
              </div>
              <Badge className="bg-[var(--color-general)]/15 text-[var(--color-general)] px-4 py-2 rounded-2xl border-0 text-sm font-black tracking-widest">
                BETA
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

//"use client";
// 
// import { useEffect, useState } from "react";
// import { useLanguage } from "@/hooks/use-language";
// import { useTheme } from "next-themes";
// import { useColorTheme } from "@/hooks/use-color-theme";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";
// import { Sun, Moon, MonitorSmartphone, Languages, Check } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import { setNotifStorage, setUiStorage } from "@/lib/storage";
// import { getThemeSelectedClass, getThemeUnselectedClass } from "@/lib/theme-utilities";
// 
// type Prefs = {
//   animations: boolean;
//   sounds: boolean;
//   quality: boolean;
//   notif_news: boolean;
//   notif_esport: boolean;
//   notif_dev: boolean;
//   dev_mode: boolean;
//   dev_access_code: string | null;
// };
// 
// export default function SettingsPage() {
//   const { t, language, setLanguage } = useLanguage();
//   const { theme: appearance, setTheme } = useTheme();
//   const [resolvedTheme, setResolvedTheme] = useState<string>("light");
//   useEffect(() => {
//     setResolvedTheme(typeof window !== "undefined" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : "light");
//   }, []);
//   const darkMode = resolvedTheme === "dark";
//   const { theme: colorTheme, setTheme: setColorTheme } = useColorTheme();
//   const [prefs, setPrefs] = useState<Prefs>(() => ({
//     animations: true,
//     sounds: false,
//     quality: true,
//     notif_news: true,
//     notif_esport: true,
//     notif_dev: true,
//   }));
// 
//   const autoFillCode = (waitForInput = false) => {
//     const code = localStorage.getItem("dev-access-code");
//     if (code && prefs.dev_mode) {
//       // Automatycznie wpisz kod gdy jest zapisany i DEV jest włączone
//       setTimeout(() => {
//         if (typeof document !== "undefined") {
//           const input = document.querySelector('input[type="password"]');
//           if (input && prefs.dev_access_code !== code) {
//             // Synchronizuj tylko jeśli kod się zmienił
//             const newValue = code;
//             if (input.value !== newValue) {
//               setPrefs(prev => ({ ...prev, dev_access_code: newValue }));
//               // Automatycznie wypełnij input
//               input.value = newValue;
//             }
//           }
//         }
//       }, waitForInput ? 300 : 0);
//     }
//   };
// 
//   useEffect(() => {
//     const loadLocalStorage = (): Prefs => ({
//       animations: localStorage.getItem("ui-animations") !== "off",
//       sounds: localStorage.getItem("ui-sounds") === "on",
//       quality: localStorage.getItem("ui-quality") !== "low",
//       notif_news: localStorage.getItem("notif-news") !== "off",
//       notif_esport: localStorage.getItem("notif-esport") !== "off",
//       notif_dev: localStorage.getItem("notif-dev") !== "off",
//       dev_mode: localStorage.getItem("dev-mode") === "on",
//       dev_access_code: localStorage.getItem("dev-access-code") || null,
//     });
// 
//     (async () => {
//       const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
//       if (!user) {
//         // Bez logowania - DEV domyślnie wyłączone
//         localStorage.setItem("dev-mode", "off");
//         localStorage.removeItem("dev-access-code");
//         setPrefs(prev => ({ ...prev, dev_mode: false, dev_access_code: null }));
//         autoFillCode();
//         return;
//       }
// 
//       const currentPrefs = loadLocalStorage();
// 
//       // Jeśli DEV jest włączone, automatycznie załaduj kod
//       if (currentPrefs.dev_mode && !currentPrefs.dev_access_code) {
//         currentPrefs.dev_access_code = localStorage.getItem("dev-access-code");
//       }
// 
//       const profileDataResult = await supabase
//         .from("profiles")
//         .select("settings")
//         .eq("id", user.id)
//         .single();
// 
//       const profileData = profileDataResult.data;
// 
//       if (profileData?.settings) {
//         currentPrefs = {
//           ...currentPrefs,
//           dev_mode: profileData.settings.dev_mode ?? currentPrefs.dev_mode,
//           dev_access_code: profileData.settings.dev_access_code ?? currentPrefs.dev_access_code,
//         };
//       }
// 
//       setPrefs(currentPrefs);
//       setUiStorage("animations", profileData?.settings?.animations);
//       setUiStorage("sounds", profileData?.settings?.sounds);
//       setUiStorage("quality", profileData?.settings?.quality);
//       setNotifStorage("notif_news", profileData?.settings?.notif_news);
//       setNotifStorage("notif_esport", profileData?.settings?.notif_esport);
//       setNotifStorage("notif_dev", profileData?.settings?.notif_dev);
//       setUiStorage("dev_mode", currentPrefs.dev_mode);
//       setUiStorage("dev_access_code", currentPrefs.dev_access_code);
//     })();
//   }, []);
// 
//   // Automatycznie synchronizuj kod dostępowy z delayem
//   useEffect(() => {
//     autoFillCode(true);
//   }, [prefs.dev_mode]);
// 
//   const getThemeColor = () => colorTheme === "ocean" ? "var(--color-general)" :
//     colorTheme === "crimson" ? "var(--color-records)" :
//     colorTheme === "emerald" ? "var(--color-esports)" :
//     colorTheme === "violet" ? "var(--color-primary)" : "var(--color-general)";
// 
//   const setPref = async (key: keyof Prefs, value: string | boolean) => {
//     setPrefs((prev) => ({ ...prev, [key]: value }));
//     setNotifStorage("notif_news", value);
//     setNotifStorage("notif_esport", value);
//     setNotifStorage("notif_dev", value);
//     setUiStorage("animations", value);
//     setUiStorage("sounds", value);
//     setUiStorage("quality", value);
//     localStorage.setItem("dev-mode", value ? "on" : "off");
//     if (key === "dev_access_code") {
//       if (value) {
//         // Zapisuj kod tylko jeśli nie jest pusty
//         localStorage.setItem("dev-access-code", value);
//       } else {
//         localStorage.removeItem("dev-access-code");
//       }
//     }
//   };
// 
//   const AppearanceOption = ({ value, icon: Icon, label }: { value: "light" | "dark" | "system"; icon: any; label: string }) => {
//     return (
//       <button
//         onClick={() => setTheme(value)}
//         className={`${getThemeUnselectedClass()} ${getThemeSelectedClass(darkMode)}`}
//       >
//         <Icon className="text-[var(--color-general)] shrink-0 size-8" />
//         <div className="text-center mt-1">
//           <div className="text-sm font-black">{label}</div>
//           {value === "light" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Pełne światło</div>}
//           {value === "dark" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Komfort oczu</div>}
//           {value === "system" && <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Zgodnie z sys.</div>}
//         </div>
//       </button>
//     );
//   };
// 
//   const ColorChip = ({ value, label, className }: { value: "ocean" | "crimson" | "emerald" | "violet" | "amber"; label: string; className?: string }) => {
//     const isSelected = colorTheme === value;
//     const themeColor = getThemeColor();
//     return (
//       <button
//         onClick={() => setColorTheme(value)}
//         className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isSelected ? "bg-white/10 border-[var(--color-general)]" : "bg-[var(--bg)]/50 border-[var(--border-color)]"}`}
//       >
//         <span className={`w-6 h-6 shrink-0 rounded-full ${isSelected ? "" : "bg-white/20"}`} style={{ background: `var(--${value}-theme-color, currentColor)` }} />
//         <div className="text-left overflow-hidden">
//           <div className="text-sm font-bold truncate">{label}</div>
//           {isSelected && <Check size={16} className="text-[var(--color-general)] ml-auto" />}
//         </div>
//       </button>
//     );
//   };
// 
//   const themeColor = getThemeColor();
// 
//   return (
//     <div className="container mx-auto p-6 mt-20 max-w-7xl transition-colors">
//       <div className="relative overflow-hidden rounded-[2.5rem] glass p-8 border-2 border-[var(--color-general)]/30">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] font-[family-name:var(--font-space)]">USTAWIENIA</h1>
//             <p className="mt-2 font-[family-name:var(--font-outfit)] text-zinc-400">{t.settings.subtitle}</p>
//           </div>
//           <Badge className={`bg-[${themeColor}]/15 text-[${themeColor}] px-4 py-2 rounded-2xl border-0`}>Twoja sesja</Badge>
//         </div>
//       </div>
// 
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
//         <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
//           <CardHeader>
//             <CardTitle className="text-[var(--text)]">{t.settings.appearance}</CardTitle>
//           </CardHeader>
//           <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <AppearanceOption value="light" icon={Sun} label={t.settings.light} />
//             <AppearanceOption value="dark" icon={Moon} label={t.settings.dark} />
//             <AppearanceOption value="system" icon={MonitorSmartphone} label={t.settings.system} />
//           </CardContent>
//         </Card>
// 
//         <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
//           <CardHeader>
//             <CardTitle className="text-[var(--text)]">{t.settings.language}</CardTitle>
//           </CardHeader>
//           <CardContent className="grid grid-cols-2 gap-4">
//             <button
//               onClick={() => setLanguage("pl")}
//               className={`flex items-center gap-3 px-5 py-6 rounded-2xl border transition-all ${language === "pl" ? `bg-[${themeColor}]/15 border-[${themeColor}]` : "bg-[var(--bg)]/50 border-[var(--border-color)]"}`}
//             >
//               <Languages className="text-[var(--color-general)]" />
//               <div>
//                 <div className="text-lg font-black">PL</div>
//                 <div className="text-xs opacity-60">POLSKI</div>
//               </div>
//               {language === "pl" && <Check size={16} className="text-[var(--color-general)] ml-auto" />}
//             </button>
//             <button
//               onClick={() => setLanguage("en")}
//               className={`flex items-center gap-3 px-5 py-6 rounded-2xl border transition-all ${language === "en" ? `bg-[${themeColor}]/15 border-[${themeColor}]` : "bg-[var(--bg)]/50 border-[var(--border-color)]"}`}
//             >
//               <Languages className="text-[var(--color-general)]" />
//               <div>
//                 <div className="text-lg font-black">US</div>
//                 <div className="text-xs opacity-60">ENGLISH</div>
//               </div>
//               {language === "en" && <Check size={16} className="text-[var(--color-general)] ml-auto" />}
//             </button>
//           </CardContent>
//         </Card>
// 
//         <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
//           <CardHeader>
//             <CardTitle className="text-[var(--text)]">{t.settings.colorTheme}</CardTitle>
//           </CardHeader>
//           <CardContent className="grid grid-cols-2 gap-4">
//             <ColorChip value="ocean" label={t.settings.themes.default} />
//             <ColorChip value="crimson" label="Cyberpunk" />
//             <ColorChip value="emerald" label="Nature" />
//             <ColorChip value="violet" label="Midnight" />
//           </CardContent>
//         </Card>
//       </div>
// 
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 items-start">
//         <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
//           <CardHeader>
//             <CardTitle className="text-[var(--text)]">Interfejs</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
//               <div className="font-medium">Animacje</div>
//               <Switch checked={prefs.animations} onCheckedChange={(v) => setPref("animations", v)} />
//             </div>
//             <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
//               <div className="font-medium">Dźwięki UI</div>
//               <Switch checked={prefs.sounds} onCheckedChange={(v) => setPref("sounds", v)} />
//             </div>
//             <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
//               <div className="font-medium">Wysoka jakość</div>
//               <Switch checked={prefs.quality} onCheckedChange={(v) => setPref("quality", v)} />
//             </div>
//           </CardContent>
//         </Card>
// 
//         <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
//           <CardHeader className="flex items-center justify-between">
//             <CardTitle className="text-[var(--text)]">{t.settings.notifications}</CardTitle>
//             <Badge className="bg-[var(--color-general)]/15 text-[var(--color-general)] px-3 py-1 rounded-2xl border-0">Bezpieczne dane</Badge>
//           </CardHeader>
//           <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="rounded-3xl border p-6 space-y-2 bg-[var(--bg)]/50 border-[var(--border-color)]">
//               <div className="text-sm font-black">{t.settings.news}</div>
//               <div className="text-xs opacity-60">{t.settings.newsDesc}</div>
//               <div className="pt-2">
//                 <Switch checked={prefs.notif_news} onCheckedChange={(v) => setPref("notif_news", v)} />
//               </div>
//             </div>
//             <div className="rounded-3xl border p-6 space-y-2 transition-colors bg-[var(--bg)]/50 border-[var(--border-color)]">
//               <div className="text-sm font-black">{t.settings.esport}</div>
//               <div className="text-xs opacity-60">{t.settings.esportDesc}</div>
//               <div className="pt-2">
//                 <Switch checked={prefs.notif_esport} onCheckedChange={(v) => setPref("notif_esport", v)} />
//               </div>
//             </div>
//             <div className="rounded-3xl border p-6 space-y-2 transition-colors bg-[var(--bg)]/50 border-[var(--border-color)]">
//               <div className="text-sm font-black">{t.settings.dev}</div>
//               <div className="text-xs opacity-60">{t.settings.devDesc}</div>
//               <div className="pt-2">
//                 <Switch checked={prefs.notif_dev} onCheckedChange={(v) => setPref("notif_dev", v)} />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
// 
//         <Card className="rounded-[2.5rem] glass lg:col-span-2 border-2 border-[var(--color-general)]/30 bg-[var(--color-general)]/5 dark:bg-[var(--color-general)]/10">
//           <CardHeader className="flex items-center justify-between">
//             <CardTitle className="text-[var(--text)] font-black">DEV MODE</CardTitle>
//             <Badge className={`${prefs.dev_mode ? `bg-[${themeColor}]` : "bg-zinc-500"} text-white px-3 py-1 rounded-2xl border-0`}>
//               {prefs.dev_mode ? "WŁĄCZONY" : "WYŁĄCZONY"}
//             </Badge>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between px-4 py-3 rounded-2xl border-[var(--border-color)] bg-[var(--bg)]/50">
//               <div className="font-medium">Tryb deweloperski</div>
//               <Switch
//                 checked={prefs.dev_mode}
//                 onCheckedChange={(v) => setPref("dev_mode", v)}
//               />
//             </div>
// 
//             {prefs.dev_mode && (
//               <div className="space-y-3 p-4 rounded-2xl border border-[var(--color-general)]/30 bg-[var(--color-general)]/10">
//                 <div className="text-sm font-bold">Kod dostępowy do DEV</div>
//                 <div className="text-xs opacity-70">
//                   Wpisz kod dostępowy aby wejść do trybu DEV. Kod zostanie zapisany w przeglądarce na 15 minut.
//                 </div>
//                 <div className="flex gap-2">
//                   <input
//                     type="password"
//                     placeholder="Wpisz kod..."
//                     className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-black/50 text-white placeholder:text-zinc-400/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-general)] font-mono text-sm"
//                     value={prefs.dev_access_code ?? ""}
//                     onChange={(e) => setPref("dev_access_code", e.target.value)}
//                   />
//                   <Button
//                     onClick={() => setPref("dev_access_code", prefs.dev_access_code)}
//                     variant="outline"
//                     className="px-4 py-3 border-[var(--color-general)]/30 text-[var(--color-general)] hover:bg-[var(--color-general)]/20"
//                   >
//                     Zapisz
//                   </Button>
//                 </div>
//                 {prefs.dev_access_code && (
//                   <div className="flex items-center gap-2 text-xs text-zinc-400/80 px-2 py-1 rounded">
//                     <span className="font-mono bg-[var(--color-general)]/20 px-2 py-1 rounded">Zapisany kod:</span>
//                     <span className="font-mono font-bold">{prefs.dev_access_code}</span>
//                     <span className="opacity-60">· (ważny na 15 min)</span>
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//         <div className="mt-10">
//           <Card className="rounded-[2.5rem] glass bg-white/0 dark:bg-black/40 border-2 border-[var(--color-general)]/30">
//             <CardContent className="flex items-center justify-between px-8 py-6">
//               <div className="flex items-center gap-4">
//                 <div className="flex flex-col">
//                   <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Wersja aplikacji</span>
//                   <span className="text-2xl font-black font-mono text-[var(--text)]">
//             Beta{" "}
//                     <span className="text-[var(--color-general)]">0.1</span>
//           </span>
//                 </div>
//               </div>
//               <Badge className="bg-[var(--color-general)]/15 text-[var(--color-general)] px-4 py-2 rounded-2xl border-0 text-sm font-black tracking-widest">
//                 BETA
//               </Badge>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }