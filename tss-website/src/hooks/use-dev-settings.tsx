"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useDevSettings() {
  const [isDevEnabled, setIsDevEnabled] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    const loadDevSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

        if (!user) {
          // Bez logowania - DEV domyślnie wyłączony
          setIsDevEnabled(false);
          setDevCode(null);
          localStorage.setItem("dev-mode", "off");
          localStorage.removeItem("dev-access-code");
          return;
        }

        // Załaduj ustawienia z bazy i localStorage
        const loadLocalStorage = () => {
          const devMode = localStorage.getItem("dev-mode") === "on";
          const savedCode = localStorage.getItem("dev-access-code") || null;
          return { isDevEnabled: devMode, devCode: savedCode };
        };

        let currentSettings = loadLocalStorage();

        // Próba pobrania z bazy
        const { data: profileDataResult } = await supabase
          .from("profiles")
          .select("settings")
          .eq("id", user.id)
          .single();

        const profileData = profileDataResult?.data;

        if (profileData?.settings) {
          currentSettings = {
            isDevEnabled: profileData.settings.dev_mode ?? currentSettings.isDevEnabled,
            devCode: profileData.settings.dev_access_code ?? currentSettings.devCode,
          };
        }

        setIsDevEnabled(currentSettings.isDevEnabled);
        setDevCode(currentSettings.devCode);
      } catch (error) {
        console.error("[DEV-SETTINGS] Error:", error);
        setIsDevEnabled(false);
        setDevCode(null);
      }
    };

    loadDevSettings();
  }, []);

  return { isDevEnabled, devCode, setIsDevEnabled, setDevCode };
}
