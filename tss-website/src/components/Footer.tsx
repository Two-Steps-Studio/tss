import React from "react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 px-4 border-t border-white/10 mt-auto">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                
                <div className="order-2 sm:order-1">
                    <a
                    href="/terms"
                    className="text-zinc-600 text-sm font-medium tracking-wide hover:text-general transition-colors duration-200"
                    >
                    Terms of Use
                </a>
            </div>

            <div className="hidden sm:block w-px h-4 bg-white/10 order-2" />

            <div className="text-center order-1 sm:order-3">
                <p className="text-sm text-zinc-600 font-medium">
                    © Two Steps Studio 2026 — Create. Build. Inspire.
                </p>
                <p className="text-xs text-zinc-600 font-medium mt-1 tracking-widest uppercase">
                    Beta · v0.1
                </p>
            </div>

            <div className="hidden sm:block w-px h-4 bg-white/10 order-4" />

            <div className="order-3 sm:order-5">
                <a
                href="/privacy"
                className="text-zinc-600 text-sm font-medium tracking-wide hover:text-general transition-colors duration-200"
                >
                Privacy Policy
            </a>
        </div>
</div>
</footer>
);
}