import React from "react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 border-t border-white/10 mt-auto flex justify-center items-center gap-6">

            <div>
                <a
                    href="/termsofuse"
                    className="text-zinc-500 hover:underline font-medium"
                >
                    Terms of Use
                </a>
            </div>

            <div className="text-center">


                <p className="text-sm text-zinc-500 font-medium">
                    © Two Steps Studio 2026 - Create. Build. Inspire.
                </p>

                <p className="text-sm text-zinc-500 font-medium">
                    Beta Version - 0.1
                </p>
            </div>

            <div>
                <a
                    href="/privacypolicy"
                    className="text-zinc-500 hover:underline font-medium"
                >
                    Privacy Policy
                </a>
            </div>

        </footer>
    );
}