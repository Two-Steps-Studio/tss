"use client";

import React, { useEffect, useState, DragEvent, FormEvent, Fragment } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {Badge} from "@/components/ui/badge";

type ColumnType = "todo" | "in_progress" | "completed";

type CardType = {
  title: string;
  id: number | string;
  status: ColumnType;
  description?: string;
  assigned_to?: number;
};

const COLUMNS: ColumnType[] = ["todo", "in_progress", "completed"];

const getColumnTitle = (column: ColumnType): string => {
  const titles: Record<ColumnType, string> = {
    todo: "TODO",
    in_progress: "Doing",
    completed: "Done",
  };
  return titles[column];
};

let highlightedIndicator: HTMLDivElement | null = null;

const getIndicators = (column: ColumnType) => {
  return Array.from(document.querySelectorAll(`[data-column="${column}"]`)).map(el => {
    const before = parseInt((el as HTMLElement).dataset.before || "-1");
    return { element: el as HTMLDivElement, before };
  }).sort((a, b) => a.before - b.before);
};

const clearHighlights = () => {
  if (highlightedIndicator) {
    highlightedIndicator.classList.remove("h-6");
    highlightedIndicator.classList.add("h-0.5");
    highlightedIndicator = null;
  }
};

const highlightIndicator = (e: DragEvent, column: ColumnType) => {
  const { clientY } = e;
  const indicators = getIndicators(column);
  for (const indicator of indicators) {
    const rect = indicator.element.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    if (Math.abs(clientY - center) < 30) {
      indicator.element.classList.remove("h-0.5");
      indicator.element.classList.add("h-6");
      highlightedIndicator = indicator.element;
      return;
    }
  }
};

const MobileStyles = () => (
    <style>{`
    @media (max-width: 768px) {
      .dev-board-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .dev-board-title { font-size: 1.5rem !important; }
      .dev-board { flex-direction: column; gap: 0.5rem; }
      .dev-column { width: 100%; box-sizing: border-box; }
      .dev-main { padding: 1rem !important; }
    }
  `}</style>
);

export default function KanbanBoard() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [addingColumn, setAddingColumn] = useState<ColumnType | null>(null);
  const [newTitles, setNewTitles] = useState<Record<ColumnType, string>>({
    todo: "",
    in_progress: "",
    completed: "",
  });
  const [newDescriptions, setNewDescriptions] = useState<Record<ColumnType, string>>({
    todo: "",
    in_progress: "",
    completed: "",
  });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    } else if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setDarkMode(mq.matches);
      const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await fetch("/api/dev-tasks");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setCards((await res.json()) || []);
    } catch (e) {
      setErrors(["Failed to load tasks. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (e: DragEvent, column: ColumnType) => {
    e.preventDefault();
    e.stopPropagation();
    clearHighlights();
    const cardId = String(e.dataTransfer.getData("cardId"));
    if (!cardId) return;
    setCards(prev => prev.map(c => String(c.id) === cardId ? { ...c, status: column } : c));
    try {
      await fetch(`/api/dev-tasks/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: column }),
      });
    } catch (e) {
      console.error("Drag update failed:", e);
    }
  };

  const handleAddNewTitle = (column: ColumnType, value: string) =>
      setNewTitles(prev => ({ ...prev, [column]: value }));

  const handleAddNewDescription = (column: ColumnType, value: string) =>
      setNewDescriptions(prev => ({ ...prev, [column]: value }));

  const LoadingState = () => (
      <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
        {COLUMNS.slice(0, 2).map(col => (
            <div key={col} className="w-72 shrink-0 flex flex-col items-center justify-center rounded border border-dashed border-neutral-300 p-8">
              <Loader2 className="animate-spin text-neutral-400" size={32} />
              <p className="mt-4 text-sm text-neutral-500">Loading...</p>
            </div>
        ))}
      </div>
  );

  const ErrorState = () => (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-red-300 bg-red-50 p-6 text-center">
        <p className="mb-2 font-medium text-red-700">Error loading tasks</p>
        <p className="mb-4 text-sm text-red-600">{errors[0]}</p>
        <button onClick={fetchCards} className="rounded px-4 py-2 text-sm font-medium bg-red-200 text-red-900 hover:bg-red-300">
          Retry
        </button>
      </div>
  );

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
                <span className="text-[var(--color-dev)]">Zadania</span>
              </h1>

              <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl font-[family-name:var(--font-outfit)] text-lg md:text-xl leading-relaxed">
                Tu znajdziesz wszystkie zadania.
              </p>
            </div>
          </div>
        </div>

        <MobileStyles />
        <div className={`h-screen w-full transition-colors duration-300 dev-main p-6 ${darkMode ? "bg-neutral-900 text-neutral-50" : "bg-transparent"}`}>
          <header className="mb-6 flex items-center gap-4 dev-board-header">
            <h1 className={`text-3xl font-bold dev-board-title ${darkMode ? "text-white" : ""}`}>Task Table</h1>
            <button
                onClick={fetchCards}
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            >
              <Loader2 size={16} className="animate-spin" />
              Refresh
            </button>
            <button
                onClick={() => setAddingColumn("todo")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--color-dev)] text-white rounded hover:bg-[var(--color-dev)]/80 transition-colors"
            >
              <Plus size={16} />
              Add Task
            </button>
          </header>

          {loading ? <LoadingState /> : errors.length ? <ErrorState /> : (
              <div className="flex h-full w-full gap-4 overflow-x-auto flex-col md:flex-row dev-board">
                {COLUMNS.map(col => (
                    <Column
                        key={col}
                        title={getColumnTitle(col)}
                        column={col}
                        cards={cards.filter(c => c.status === col)}
                        setCards={setCards}
                        onDragEnd={handleDragEnd}
                        adding={addingColumn === col}
                        setAdding={(adding: boolean) => setAddingColumn(adding ? col : null)}
                        newTitle={newTitles[col]}
                        setNewTitle={(val: string) => handleAddNewTitle(col, val)}
                        newDescription={newDescriptions[col]}
                        setDescription={(val: string) => handleAddNewDescription(col, val)}
                        darkMode={darkMode}
                    />
                ))}
              </div>
          )}
        </div>
      </>
  );
}

type ColumnProps = {
  title: string;
  column: ColumnType;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onDragEnd: (e: DragEvent, column: ColumnType) => Promise<void>;
  adding: boolean;
  setAdding: (adding: boolean) => void;
  newTitle: string;
  setNewTitle: (value: string) => void;
  newDescription: string;
  setDescription: (value: string) => void;
  darkMode: boolean;
};

const Column = ({
                  title, column, cards, setCards, onDragEnd,
                  adding, setAdding, newTitle, setNewTitle,
                  newDescription, setDescription, darkMode,
                }: ColumnProps) => {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e, column);
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm("Delete this task?")) return;
    const card = cards.find(c => String(c.id) === cardId);
    if (!card) return;
    setCards(prev => prev.filter(c => String(c.id) !== cardId));
    try {
      await fetch(`/api/dev-tasks/${card.id}`, { method: "DELETE" });
    } catch {
      setCards(prev => [...prev, card]);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle?.trim()) return;
    fetch("/api/dev-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), description: newDescription || "", status: column, assigned_to: null }),
    })
        .then(async res => {
          const data = await res.json();
          if (data.error) { setAdding(false); return; }
          if (data?.id) {
            setCards(prev => [...prev, { title: data.title || newTitle.trim(), description: newDescription || "", status: column, id: data.id }]);
          }
          setNewTitle("");
          setAdding(false);
        })
        .catch(() => setAdding(false));
  };

  return (
      <div className="w-72 shrink-0 flex flex-col dev-column">
        <div className={`mb-4 flex items-center justify-between sticky top-0 z-10 border-b px-3 py-3 ${darkMode ? "border-neutral-800" : "border-[var(--border-color)]"}`}>
          <h3 className="flex items-center gap-2 font-medium">
            <ColumnIcon column={column} darkMode={darkMode} />
            {title}
          </h3>
          <span className={`rounded text-sm px-2 py-1 ${darkMode ? "text-neutral-400 bg-neutral-800" : "text-neutral-600 bg-neutral-200"}`}>
          {cards.length}
        </span>
        </div>
        <div
            onDragOver={handleDragOver}
            onDragLeave={clearHighlights}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragEnd={(e) => onDragEnd(e, column)}
            className="h-full w-full flex flex-col gap-3 p-2 rounded-lg"
        >
          <DropIndicator beforeId={null} column={column} />
          {cards.map((c, i) => (
              <Fragment key={`${column}-${c.id}-${i}`}>
                <Card
                    {...c}
                    handleDragStart={(e, card) => e.dataTransfer.setData("cardId", String(card.id))}
                    onDelete={handleDelete}
                    setCards={setCards}
                    darkMode={darkMode}
                    description={c.description || ""}
                />
                <DropIndicator beforeId={String(c.id)} column={column} />
              </Fragment>
          ))}
          <AddCard
              column={column}
              setCards={setCards}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              adding={adding}
              setAdding={setAdding}
              handleSubmit={handleSubmit}
              darkMode={darkMode}
              description={newDescription || ""}
              setDescription={setDescription}
          />
        </div>
      </div>
  );
};

const ColumnIcon = ({ column, darkMode }: { column: ColumnType; darkMode: boolean }) => {
  const icons: Record<ColumnType, React.ReactNode> = {
    todo: <span className={`text-xl ${darkMode ? "text-yellow-200" : "text-yellow-600"}`}>⚙</span>,
    in_progress: <span className={`text-xl ${darkMode ? "text-blue-200" : "text-blue-600"}`}>🔧</span>,
    completed: <span className={`text-xl ${darkMode ? "text-emerald-200" : "text-emerald-600"}`}>✓</span>,
  };
  return <>{icons[column]}</>;
};

type CardProps = CardType & {
  handleDragStart: (e: DragEvent, card: CardType) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
  description: string;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
};

const Card = ({ title, id, status, handleDragStart, onDelete, darkMode, description, setCards }: CardProps) => {
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [localDescription, setLocalDescription] = useState(description || "");

  const handleToggleComplete = async () => {
    const newStatus: ColumnType = status === "completed" ? "in_progress" : "completed";
    try {
      const res = await fetch(`/api/dev-tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCards(prev => prev.map(c => String(c.id) === String(id) ? { ...c, status: newStatus } : c));
      }
    } catch (e) {
      console.error("Toggle failed:", e);
    }
  };

  return (
      <motion.div
          layout
          layoutId={String(id)}
          draggable
          onDragStart={(e) => {
            (e as unknown as DragEvent).dataTransfer.effectAllowed = "move";
            handleDragStart(e as unknown as DragEvent, { title, id, status });
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`cursor-grab rounded border p-3 text-sm font-medium leading-relaxed group relative transition-colors flex flex-col gap-2 ${
              darkMode ? "border-neutral-700 hover:bg-[var(--color-dev)]/5" : "border-neutral-200 bg-white hover:bg-[var(--color-dev)]/5"
          }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={status === "completed" ? "line-through opacity-50" : ""}>{title}</p>
            {showDescriptionEditor ? (
                <div className="mt-2 flex flex-col gap-1">
              <textarea
                  onChange={(e) => setLocalDescription(e.target.value)}
                  value={localDescription}
                  placeholder="Add description..."
                  className={`w-full rounded p-2 text-xs resize-none h-20 ${
                      darkMode ? "border border-[var(--color-dev)]/50 bg-[var(--color-dev)]/10 text-white" : "border border-neutral-300 bg-neutral-100 text-neutral-900"
                  }`}
                  rows={4}
                  maxLength={500}
              />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{localDescription.length}/500</span>
                    <div className="flex gap-2">
                      <button
                          onClick={() => {
                            fetch(`/api/dev-tasks/${id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ description: localDescription }),
                            });
                            setShowDescriptionEditor(false);
                          }}
                          className="text-xs px-2 py-1 rounded bg-[var(--color-dev)]/20 text-[var(--color-dev)] hover:bg-[var(--color-dev)]/40"
                      >
                        Save
                      </button>
                      <button
                          onClick={() => { setLocalDescription(description || ""); setShowDescriptionEditor(false); }}
                          className="text-xs px-2 py-1 rounded bg-neutral-200/50 text-neutral-600 hover:bg-neutral-300/50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
            ) : description ? (
                <p
                    className="text-xs text-neutral-500 mt-1 hover:underline cursor-pointer"
                    onClick={() => setShowDescriptionEditor(true)}
                >
                  {description}
                </p>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <button
                onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
                className={`p-1 rounded transition-all ${
                    status === "completed"
                        ? "text-emerald-600 bg-emerald-100/50"
                        : "opacity-0 group-hover:opacity-100 text-emerald-600 hover:bg-emerald-100/50"
                }`}
                title="Toggle complete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M20 6.99 9 17.99 4.41 13.41" />
              </svg>
            </button>
            <button
                onClick={() => onDelete(String(id))}
                className={`p-1 rounded transition-all ${
                    darkMode ? "text-neutral-500 hover:text-red-400 hover:bg-red-900/20" : "text-neutral-400 hover:text-red-600 hover:bg-red-100/50"
                }`}
                title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
  );
};

const DropIndicator = ({ beforeId, column }: { beforeId: string | null; column: ColumnType }) => (
    <div
        data-before={beforeId || "-1"}
        data-column={column}
        className="my-0.5 h-0.5 w-full bg-[var(--color-dev)]/50 rounded-full transition-all"
    />
);

type AddCardProps = {
  column: ColumnType;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  newTitle: string;
  setNewTitle: (title: string) => void;
  adding: boolean;
  setAdding: (adding: boolean) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  darkMode: boolean;
  description: string;
  setDescription: (value: string) => void;
};

const AddCard = ({ newTitle, setNewTitle, adding, setAdding, handleSubmit, darkMode }: AddCardProps) => {
  return adding ? (
      <motion.form layout onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
          onChange={(e) => setNewTitle(e.target.value)}
          value={newTitle}
          autoFocus
          placeholder="Add new task..."
          className={`w-full rounded p-3 text-sm resize-none ${
              darkMode
                  ? "border border-[var(--color-dev)]/50 bg-[var(--color-dev)]/10 text-white placeholder-[var(--color-dev)]/50"
                  : "border border-neutral-300 bg-neutral-100 text-neutral-900 placeholder-neutral-400"
          }`}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
            }
          }}
      />
        <div className="flex items-center justify-end gap-2">
          <button
              type="button"
              onClick={() => setAdding(false)}
              className={`px-4 py-1.5 text-xs rounded ${darkMode ? "text-neutral-400 hover:bg-neutral-800" : "text-neutral-500 hover:bg-neutral-200"}`}
          >
            Cancel
          </button>
          <button
              type="submit"
              className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium ${
                  darkMode ? "bg-[var(--color-dev)]/80 text-white hover:bg-[var(--color-dev)]" : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
          >
            Add <Plus size={14} />
          </button>
        </div>
      </motion.form>
  ) : (
      <button
          onClick={() => setAdding(true)}
          className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
              darkMode ? "text-neutral-400 hover:bg-neutral-800" : "text-neutral-500 hover:bg-neutral-100"
          }`}
      >
        <Plus size={14} /> Add task
      </button>
  );
};