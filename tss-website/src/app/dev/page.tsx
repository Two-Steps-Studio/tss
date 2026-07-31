import { Metadata } from "next";
import { DevPageClient } from "@/components/DEV/DevPageClient";

export const metadata: Metadata = {
  title: "DEV - Two Steps Studio",
  description: "Panel deweloperski Two Steps Studio - zarządzanie projektami",
  openGraph: {
    title: "DEV - Two Steps Studio",
    description: "Panel deweloperski Two Steps Studio - zarządzanie projektami",
    url: "https://twostepsstudio.vercel.app/dev",
  },
};

export default function DevPage() {
  return <DevPageClient />;
}