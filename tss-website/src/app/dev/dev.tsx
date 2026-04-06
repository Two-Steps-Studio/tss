"use client";

import React, { useEffect, useState, DragEvent, FormEvent, Fragment } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type ColumnType = "pending" | "todo" | "in_progress" | "completed";

type CardType = {
  title: string;
  id: number | string;
  status: ColumnType;
  description?: string;
  assigned_to?: number;
};

const COLUMNS: ColumnType[] = ["pending", "todo", "in_progress", "completed"];

const getColumnTitle = (column: ColumnType): string => {
  const titles: Record<ColumnType, string> = {
    pending: "Backlog",
    todo: "TODO",
    in_progress: "Doing",
    completed: "Done",
  };
  return titles[column];
};

// Drag helpers
let highlightedIndicator: HTMLDivElement | null = null;

const getIndicators = (column: ColumnType) => {
  return Array.from(document.querySelectorAll(`[data-column="${column}"]`)).map(el => {
    const before = parseInt(el.dataset.before || "-1");
    return { element: el as HTMLDivElement, before };
  }).sort((a, b) => a.before - b.before);
};

const getNearestIndicator = (e: DragEvent, indicators: Array<{ element: HTMLDivElement; before: number }>) => {
  if (!indicators.length) return { element: document.body };
  const { clientY } = e;
  let minDistance = Infinity;
  let nearest: typeof indicators[0] | null = null;

  for (const indicator of indicators) {
    const indicatorRect = indicator.element.getBoundingClientRect();
    const indicatorCenter = indicatorRect.top + indicatorRect.height / 2;
    const distance = Math.abs(clientY - indicatorCenter);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = indicator;
    }
  }
  return nearest || { element: document.body, before: -1 };
};

const clearHighlights = () => {
  if (highlightedIndicator) {
    highlightedIndicator.classList.remove("h-6");
    highlightedIndicator.classList.add("h-0.5");
    highlightedIndicator.classList.remove("bg-[var(--color-dev)]");
    highlightedIndicator.classList.add("bg-[var(--color-dev)]/50");
    highlightedIndicator = null;
  }
};

const highlightIndicator = (e: DragEvent, column: ColumnType) => {
  const { clientY } = e;
  const indicators = getIndicators(column);

  for (const indicator of indicators) {
    const indicatorRect = indicator.element.getBoundingClientRect();
    const indicatorCenter = indicatorRect.top + indicatorRect.height / 2;
    const distance = Math.abs(clientY - indicatorCenter);

    if (distance < 30) {
      indicator.element.classList.remove("h-0.5");
      indicator.element.classList.add("h-6");
      indicator.element.classList.remove("bg-[var(--color-dev)]/50");
      indicator.element.classList.add("bg-[var(--color-dev)]");
      highlightedIndicator = indicator.element;
      return;
    }
  }
};

const MobileStyles = () => (
    <style>{`
    @media (max-width: 768px) {
      .dev-board-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .dev-board-header h1 { font-size: 1.5rem !important; }
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
    pending: "",
    todo: "",
    in_progress: "",
    completed: "",
  });
  const [newDescriptions, setNewDescriptions] = useState<Record<ColumnType, string>>({
    pending: "",
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
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setDarkMode(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const response = await fetch("/api/dev-tasks");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      setCards(responseData || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setErrors(["Failed to load tasks. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const updateCardInDb = async (card: CardType) => {
    try {
      await fetch(`/api/dev-tasks/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: card.title,
          description: card.description || "",
          status: card.status,
          assigned_to: card.assigned_to,
        }),
      });
    } catch (error) {
      console.error("Failed to update card in DB:", error);
      return false;
    }
    return true;
  };

  const handleDragEnd = async (e: DragEvent, column: ColumnType) => {
    e.preventDefault();
    e.stopPropagation();

    const cardId = String(e.dataTransfer.getData("cardId"));
    clearHighlights();

    const card = cards.find(c => String(c.id) === cardId);
    if (!card) return;

    const updatedCard = { ...card, status: column };
    setCards(prev => prev.map(c => String(c.id) === cardId ? updatedCard : c));

    const success = await updateCardInDb(updatedCard);
    if (!success) setCards(cards);
  };

  // FIX: poprawna funkcja do ustawiania tytułu per kolumna
  const handleAddNewTitle = (column: ColumnType, value: string) => {
    setNewTitles(prev => ({ ...prev, [column]: value }));
  };

  const handleAddNewDescription = (column: ColumnType, value: string) => {
    setNewDescriptions(prev => ({ ...prev, [column]: value }));
  };

  const LoadingState = () => (
      <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
        {COLUMNS.slice(0, 2).map((column) => (
            <div key={column} className="w-72 shrink-0">
              <div className="mb-4 flex items-center justify-between">
                <h3 className={`font-medium ${!darkMode ? "text-neutral-700" : "text-neutral-500"}`}>
                  {getColumnTitle(column)}
                </h3>
                <span className={`rounded text-sm px-2 py-1 ${!darkMode ? "text-neutral-600 bg-neutral-200" : "text-neutral-400 bg-neutral-800"}`}>-</span>
              </div>
              <div className={`h-full w-full flex flex-col items-center justify-center rounded border border-dashed ${!darkMode ? "border-neutral-300" : "border-neutral-700 bg-neutral-800/10"}`}>
                <Loader2 className={`animate-spin ${!darkMode ? "text-neutral-400" : "text-neutral-600"}`} size={32} />
                <p className="mt-4 text-sm text-neutral-500">Loading...</p>
              </div>
            </div>
        ))}
      </div>
  );

  const ErrorState = () => (
      <div className={`flex h-full w-full flex-col items-center justify-center rounded-lg border p-6 text-center ${!darkMode ? "border-red-300 bg-red-50" : "border-red-500 bg-red-900/20"}`}>
        <p className={`mb-2 font-medium ${!darkMode ? "text-red-700" : "text-red-400"}`}>Error loading tasks</p>
        <p className={`mb-4 text-sm ${!darkMode ? "text-red-600" : "text-red-300"}`}>{errors[0]}</p>
        <button
            onClick={fetchCards}
            className={`rounded px-4 py-2 text-sm font-medium ${!darkMode ? "bg-red-200 text-red-900 hover:bg-red-300" : "bg-red-600 text-white hover:bg-red-500"}`}
        >
          Retry
        </button>
      </div>
  );

  return (
      <>
        <MobileStyles />
        <div className={`h-screen w-full transition-colors duration-300 dev-main ${!darkMode ? "bg-transparent text-[var(--text)]" : "bg-neutral-900 text-neutral-50"}`}>
          <header className="mb-6 flex items-center justify-between dev-board-header gap-4">
            <div className="flex items-center gap-4">
              <h1 className={`text-3xl font-bold dev-board-title ${!darkMode ? "text-[var(--text)]" : "text-white"}`}>
                Task Table
              </h1>
              <button
                  onClick={fetchCards}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                <Loader2 size={16} className="animate-spin" />
                Refresh
              </button>
            </div>
            {/* FIX: otwieramy tylko kolumnę "todo" zamiast wszystkich naraz */}
            <button
                onClick={() => setAddingColumn("todo")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--color-dev)] text-white rounded hover:bg-[var(--color-dev)]/80 transition-colors"
            >
              <Plus size={16} />
              Add Task
            </button>
          </header>

          {loading ? (
              <LoadingState />
          ) : errors.length ? (
              <ErrorState />
          ) : (
              <div className="flex h-full w-full gap-4 overflow-x-auto p-4 flex-col md:flex-row dev-board">
                {COLUMNS.map((column) => (
                    <Column
                        key={column}
                        title={getColumnTitle(column)}
                        column={column}
                        cards={cards.filter(c => c.status === column)}
                        setCards={setCards}
                        onDragEnd={handleDragEnd}
                        adding={addingColumn === column}
                        setAdding={(adding: boolean) => setAddingColumn(adding ? column : null)}
                        newTitle={newTitles[column]}
                        // FIX: używamy handleAddNewTitle zamiast setNewTitles bezpośrednio
                        setNewTitle={(value: string) => handleAddNewTitle(column, value)}
                        newDescription={newDescriptions[column]}
                        setDescription={(value: string) => handleAddNewDescription(column, value)}
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
  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", String(card.id));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e, column);
  };

  const handleDragLeave = () => {
    clearHighlights();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm("Delete this task?")) return;
    const card = cards.find(c => String(c.id) === cardId);
    if (!card) return;

    setCards(prev => prev.filter(c => String(c.id) !== cardId));
    try {
      await fetch(`/api/dev-tasks/${card.id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete card:", error);
      setCards(prev => [...prev, card]);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle || !newTitle.trim()) return;

    fetch("/api/dev-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDescription || "",
        status: column,
        assigned_to: null,
      }),
    })
        .then(async (response) => {
          const responseJson = await response.json();
          if (responseJson.error) {
            console.error("Failed to create card:", responseJson.error);
            setAdding(false);
            return;
          }
          if (responseJson && typeof responseJson === "object" && responseJson.id) {
            setCards(prev => [...prev, {
              title: responseJson.title || newTitle.trim(),
              description: newDescription || "",
              status: column,
              assigned_to: undefined,
              id: responseJson.id,
            }]);
          }
          setNewTitle("");
          setAdding(false);
        })
        .catch((error) => {
          console.error("Failed to add card:", error);
          setAdding(false);
        });
  };

  return (
      <div className="w-72 shrink-0 flex flex-col dev-column dev-mobile-visible">
        <div className={`mb-4 flex items-center justify-between sticky top-0 z-10 border-b px-3 py-3 transition-colors ${!darkMode ? "border-[var(--border-color)]" : "border-neutral-800"}`}>
          <h3 className="flex items-center gap-2 font-medium">
            <ColumnIcon column={column} darkMode={darkMode} />
            {title}
          </h3>
          <span className={`rounded text-sm px-2 py-1 ${!darkMode ? "text-neutral-600 bg-neutral-200" : "text-neutral-400 bg-neutral-800"}`}>
          {cards.length}
        </span>
        </div>
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={(e) => onDragEnd(e, column)}
            className="h-full w-full flex flex-col gap-3 p-2 rounded-lg bg-transparent"
            data-before="null"
        >
          <DropIndicator beforeId={null} column={column} />
          {cards.map((c, index) => (
              <Fragment key={`${column}-${c.id}-${index}`}>
                <Card
                    {...c}
                    handleDragStart={handleDragStart}
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
              // FIX: setDescription przyjmuje tylko (value: string), bez column
              setDescription={setDescription}
          />
        </div>
      </div>
  );
};

const ColumnIcon = ({ column, darkMode }: { column: ColumnType; darkMode: boolean }) => {
  const icons: Record<ColumnType, React.ReactNode> = {
    pending: <span className={`text-xl ${!darkMode ? "text-neutral-400" : "text-neutral-500"}`}>✕</span>,
    todo: <span className={`text-xl ${!darkMode ? "text-yellow-600" : "text-yellow-200"}`}>⚙</span>,
    in_progress: <span className={`text-xl ${!darkMode ? "text-blue-600" : "text-blue-200"}`}>🔧</span>,
    completed: <span className={`text-xl ${!darkMode ? "text-emerald-600" : "text-emerald-200"}`}>✓</span>,
  };
  return icons[column];
};

type CardProps = CardType & {
  handleDragStart: (e: DragEvent, card: CardType) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
  description: string;
  setCards?: React.Dispatch<React.SetStateAction<CardType[]>>;
};

const Card = ({ title, id, status, handleDragStart, onDelete, darkMode, description, setCards }: CardProps) => {
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [localDescription, setLocalDescription] = useState(description || "");

  const handleResetProgress = async () => {
    const response = await fetch(`/api/dev-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "todo" as ColumnType }),
    });
    if (response.ok && setCards) {
      setCards(prev => prev.map(card =>
          String(card.id) === String(id) ? { ...card, status: "todo" } : card
      ));
    }
  };

  return (
      <motion.div
          layout
          layoutId={String(id)}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            handleDragStart(e, { title, id, status });
          }}
          onDragEnd={(e) => e.dataTransfer.clearData()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cursor-grab rounded border p-3 text-sm font-medium leading-relaxed group relative transition-colors flex flex-col gap-2 bg-transparent border-none dev-card hover:bg-[var(--color-dev)]/5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 w-full">
            <p className="flex-1">{title}</p>
            {showDescriptionEditor ? (
                <div className="mt-2 flex flex-col gap-1">
              <textarea
                  onChange={(e) => setLocalDescription(e.target.value)}
                  value={localDescription}
                  placeholder="Dodaj opis zadania..."
                  className={`w-full rounded p-2 text-xs resize-none h-20 ${!darkMode ? "border border-neutral-300 bg-neutral-100 text-neutral-900 placeholder-neutral-400" : "border border-[var(--color-dev)]/50 bg-[var(--color-dev)]/10 text-white placeholder-[var(--color-dev)]/50"}`}
                  rows={4}
                  maxLength={500}
              />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{localDescription.length}/500</span>
                    <div className="flex items-center gap-2">
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
                        Zapisz
                      </button>
                      <button
                          onClick={() => {
                            setLocalDescription(description || "");
                            setShowDescriptionEditor(false);
                          }}
                          className="text-xs px-2 py-1 rounded bg-neutral-200/50 text-neutral-600 hover:bg-neutral-300/50"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                </div>
            ) : description ? (
                <p
                    className="text-xs text-neutral-500 mt-1 hover:text-neutral-600 hover:underline cursor-pointer"
                    onClick={() => setShowDescriptionEditor(true)}
                >
                  {description}
                </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={() => onDelete(String(id))}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${!darkMode ? "text-neutral-400 hover:text-red-600 hover:bg-red-100/50" : "text-neutral-500 hover:text-red-400 hover:bg-red-900/20"}`}
                title="Delete task"
            >
              <Trash2 size={14} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); handleResetProgress(); }}
                className={`p-1 rounded transition-all ${!darkMode ? "text-neutral-400 hover:text-yellow-600 hover:bg-yellow-100/50" : "text-neutral-500 hover:text-yellow-400 hover:bg-yellow-900/20"}`}
                title="Resetuj postęp"
            >
              <span className="text-lg">↺</span>
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
        className="my-1 h-0.5 w-full bg-[var(--color-dev)]/50 rounded-full transition-all"
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

const AddCard = ({
                   column, newTitle, setNewTitle, adding, setAdding,
                   handleSubmit, darkMode, description, setDescription,
                 }: AddCardProps) => {
  return (
      <>
        {adding ? (
            <motion.form layout onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
              onChange={(e) => setNewTitle(e.target.value)}
              value={newTitle}
              autoFocus
              placeholder="Add new task..."
              className={`w-full rounded p-3 text-sm resize-none ${!darkMode ? "border border-neutral-300 bg-neutral-100 text-neutral-900 placeholder-neutral-400" : "border border-[var(--color-dev)]/50 bg-[var(--color-dev)]/10 text-white placeholder-[var(--color-dev)]/50"}`}
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
                    className={`px-4 py-1.5 text-xs rounded transition-colors ${!darkMode ? "text-neutral-500 hover:bg-neutral-200" : "text-neutral-400 hover:bg-neutral-800"}`}
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium transition-colors ${!darkMode ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-[var(--color-dev)]/80 text-white hover:bg-[var(--color-dev)]"}`}
                >
                  <span>Add</span>
                  <Plus size={14} />
                </button>
              </div>
            </motion.form>
        ) : (
            <button
                onClick={() => setAdding(true)}
                className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${!darkMode ? "text-neutral-500 hover:bg-neutral-100" : "text-neutral-400 hover:bg-neutral-800"}`}
            >
              <Plus size={14} />
              Add task
            </button>
        )}
      </>
  );
};