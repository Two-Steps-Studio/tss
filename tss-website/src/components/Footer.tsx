import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-white/10 mt-auto">
      <div className="px-4 text-center max-w-[1400px] mx-auto">
          <p className="text-l text-zinc-500 font-medium">
              Beta Version
          </p>
        <p className="text-sm text-zinc-500 font-medium">
            © Two Steps Studio 2026 - Create. Build. Play.
        </p>


      </div>
    </footer>
  );
}
