export default function DevHomePage() {
    const tasks = [
        { title: "UI Dashboard", status: "W trakcie", progress: 72 },
        { title: "System notatek", status: "Gotowe", progress: 100 },
        { title: "Hierarchia zespołu", status: "Plan", progress: 35 },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="container mx-auto p-6 mt-20 max-w-7xl">
                {/* Hero */}
                <div className="relative mb-16 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[var(--color-dev)]/5 border border-[var(--color-dev)]/20 backdrop-blur-md shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dev)]/10 via-transparent to-transparent opacity-60" />
                    <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--color-dev)]/20 blur-3xl" />

                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex bg-[var(--color-dev)]/20 text-[var(--color-dev)] px-4 py-1.5 text-sm font-medium rounded-full">
                            Two Steps Studio
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white tracking-tight">
                            <span className="text-[var(--color-dev)]">DEV</span>
                        </h1>

                        <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl text-lg md:text-xl leading-relaxed">
                            Zarządzaj zadaniami, ludźmi,
                            notatkami i postępem projektów w jednym miejscu.
                        </p>
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

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Zadania</h2>
                        <div className="space-y-4">
                            {tasks.map((task, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold">{task.title}</span>
                                        <span>{task.status}</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--color-dev)] rounded-full"
                                            style={{ width: `${task.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Szybkie notatki</h2>
                        <textarea
                            placeholder="Zapisz ważne info dla zespołu..."
                            className="w-full h-64 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-4 outline-none"
                        />
                    </div>

                    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Statystyki</h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500">Aktywne projekty</p>
                                <p className="text-3xl font-bold">4</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500">Członkowie teamu</p>
                                <p className="text-3xl font-bold">12</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500">Taski ukończone</p>
                                <p className="text-3xl font-bold">86%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
