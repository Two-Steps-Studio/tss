import type { ReactNode } from "react";
import { DevProjectProvider } from "@/contexts/dev-project-context";
import { DevNavigation } from "@/components/DEV/DevNavigation";
import { DevProjectSwitcher } from "@/components/DEV/DevProjectSwitcher";

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <DevProjectProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <DevNavigation />
          <DevProjectSwitcher />
        </div>
        {children}
      </div>
    </DevProjectProvider>
  );
}
