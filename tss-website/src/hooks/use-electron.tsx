"use client";

import { useEffect, useState } from "react";

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const electron = (window as any).electron;
      setIsElectron(!!electron);
      setElectronAPI(electron);
    }
  }, []);

  return {
    isElectron,
    electron: electronAPI,
    platform: electronAPI?.platform || "web",
  };
}
