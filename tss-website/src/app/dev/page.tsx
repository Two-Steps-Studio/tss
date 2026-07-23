import { Badge } from "@/components/ui/badge";

export default function WhiteBoardPage() {
    return (
        <>
            <div className="container mx-auto p-6 mt-20 max-w-7xl">
                <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[var(--color-dev)]/5 border border-[var(--color-dev)]/20 backdrop-blur-md shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dev)]/10 via-transparent to-transparent opacity-60" />
                    <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-dev)]/20 blur-3xl" />

                    <div className="relative z-10 space-y-4">
                        <Badge className="bg-[var(--color-dev)]/20 text-[var(--color-dev)] border-0 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
                            DEV
                        </Badge>

                        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white font-[family-name:var(--font-space)] tracking-tight">
                            <span className="text-[var(--color-dev)]">DEV</span>
                        </h1>

                        <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { name: "Managment", href: "/dev/managment" },
                    { name: "Tasks", href: "/dev/tasks" },
                    { name: "White-board", href: "/dev/white-board" },
                ].map((item, i) => (
                    <a
                        key={i}
                        href={item.href}
                        className="rounded-3xl border border-[var(--color-dev)]/20 bg-[var(--color-dev)]/5 hover:bg-[var(--color-dev)]/10 transition-all p-5 shadow-sm group"
                    >
                        <div className="text-lg font-bold text-black dark:text-white group-hover:text-[var(--color-dev)] transition-colors">
                            {item.name}
                        </div>
                    </a>
                ))}
            </div>

        </>
    );
}