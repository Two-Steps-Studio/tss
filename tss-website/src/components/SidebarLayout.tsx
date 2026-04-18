"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";

export function SidebarLayout() {
  const { isOpen } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const sidebarOpen = isDesktop || isOpen;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-[240px] lg:w-[240px]">
      <Sidebar isOpen={sidebarOpen} suppressHydrationWarning={true} />
    </div>
  );
}
