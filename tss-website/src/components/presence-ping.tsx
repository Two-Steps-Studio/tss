"use client";

import { useEffect } from "react";

export function PresencePing() {
  useEffect(() => {
    let mounted = true;

    const ping = async () => {
      try {
        await fetch("/api/ping", { method: "GET", credentials: "include" });
      } catch {
        // ignore
      }
    };

    ping();
    const interval = setInterval(ping, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return null;
}
