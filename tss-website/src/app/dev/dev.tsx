"use client";

export default function DevPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--bg)] dark:from-black dark:to-zinc-950 p-4 md:p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-black dark:text-white mb-2">
                    <span className="text-[var(--color-dev)]">DEV</span> 
                </h1>
            </div>
        </div>
    );
}