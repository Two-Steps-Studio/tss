import type { ReactNode } from "react";
import { DevProjectProvider } from "@/contexts/dev-project-context";
import { DevNavigation } from "@/components/DEV/DevNavigation";
import { DevProjectSwitcher } from "@/components/DEV/DevProjectSwitcher";
import { Lock } from "lucide-react";

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <DevProjectProvider>
      <DevAccessGuard>
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <DevNavigation />
            <DevProjectSwitcher />
          </div>
          {children}
        </div>
      </DevAccessGuard>
    </DevProjectProvider>
  );
}

function DevAccessGuard({ children }: { children: ReactNode }) {
  // This is a client component that will check access
  // The actual check is done in the context and pages
  return <>{children}</>;
}
