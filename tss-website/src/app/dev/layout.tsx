import type { ReactNode } from "react";
import { DevProjectProvider } from "@/contexts/dev-project-context";

export default function DevLayout({ children }: { children: ReactNode }) {
  return <DevProjectProvider>{children}</DevProjectProvider>;
}
