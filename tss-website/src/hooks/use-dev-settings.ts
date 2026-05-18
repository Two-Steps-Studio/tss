"use client";

import { useState } from "react";

export function useDevSettings() {
  const [isDevEnabled] = useState(true);

  return {
    isDevEnabled,
  };
}
