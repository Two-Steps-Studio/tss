"use client";

import React, { useEffect, useState, DragEvent, FormEvent } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  return { darkMode };
};

const { darkMode } = useDarkMode();

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

// Helper functions - defined outside components so they can be used everywhere
const reorderCards = (cards: CardType[], draggedCardId: string, newBeforeId: string | null) => {
  const cardIndex = cards.findIndex(c => String(c.id) === draggedCardId);
  if (cardIndex === -1) return cards;
  if (newBeforeId === null) return [...cards].reverse();

  const newCardIndex = cards.findIndex(c => String(c.id) === newBeforeId);
  if (newCardIndex === -1) return cards;

  const removed = cards.splice(cardIndex, 1)[0];
  const newCards = [...cards];
  newCards.splice(newCardIndex, 0, removed);
  return newCards;
};

const clearHighlights = () => {
  document.querySelectorAll("[data-highlighted='true']").forEach(el => {
    (el as HTMLElement).style.opacity = "0";
  });
};

const getIndicators = (column?: string): HTMLElement[] => {
  const selector = column ? `[data-column="${column}"]` : "[data-column]";
  return Array.from(document.querySelectorAll(selector)) as unknown as HTMLElement[];
};

const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
  const DISTANCE_OFFSET = 50;
  return indicators.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = e.clientY - (box.top + DISTANCE_OFFSET);
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
  );
};

const highlightIndicator = (e: DragEvent, column?: string) => {
  const indicators = getIndicators(column);
  clearHighlights();
  const el = getNearestIndicator(e, indicators);
  if (el?.element?.style) el.element.style.opacity = "1";
};

export default function KanbanBoard() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  // Stan dla każdego kanału - przeniesiony z Column aby uniknąć łamania reguł hooks
  const [addingColumn, setAddingColumn] = useState<ColumnType | null>(null);
  const [newTitles, setNewTitles] = useState<Record<ColumnType, string>>({
    pending: "",
    todo: "",
    in_progress: "",
    completed: "",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const response = await fetch("/api/dev-tasks");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCards(data);
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
    const cardId = String(e.dataTransfer.getData("cardId"));
    const indicators = getIndicators(column);
    const { element } = getNearestIndicator(e, indicators);
    const beforeId = element.dataset.before || null;

    clearHighlights();

    if (beforeId && beforeId !== cardId) {
      const newCards = reorderCards([...cards], cardId, beforeId);
      setCards(newCards);

      const card = newCards.find(c => String(c.id) === cardId);
      if (card) {
        const success = await updateCardInDb(card);
        if (!success) {
          setCards(cards); // Revert on failure
        }
      }
    }
  };

  const handleAddNewTitle = (column: ColumnType, value: string) => {
    setNewTitles(prev => ({ ...prev, [column]: value }));
  };

  const handleSetAdding = (column: ColumnType | null) => {
    setAddingColumn(column);
  };

  return (
    <div className={`h-screen w-full p-6 transition-colors duration-300 ${!darkMode ? 'bg-[var(--bg)] text-[var(--text)]' : 'bg-neutral-900 text-neutral-50'}`}>
      <header className="mb-6 flex items-center justify-between">
        <h1 className={`text-3xl font-bold transition-colors duration-300 ${!darkMode ? 'text-[var(--text)]' : 'text-white'}`}>Task Table</h1>
        <button
          onClick={fetchCards}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
        >
          <Loader2 size={16} className="animate-spin" />
          Refresh
        </button>
      </header>
      {loading ? (
        <LoadingState />
      ) : errors.length ? (
        <ErrorState errors={errors} onRetry={fetchCards} />
      ) : (
        <Board
          cards={cards}
          setCards={setCards}
          onDragEnd={handleDragEnd}
          addingColumn={addingColumn}
          setAddingColumn={handleSetAdding}
          newTitles={newTitles}
          setNewTitles={handleAddNewTitle}
        />
      )}
    </div>
  );
}

const Board = ({
  cards,
  setCards,
  onDragEnd,
  addingColumn,
  setAddingColumn,
  newTitles,
  setNewTitles,
}: {
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onDragEnd: (e: DragEvent, column: ColumnType) => Promise<void>;
  addingColumn: ColumnType | null;
  setAddingColumn: (column: ColumnType | null) => void;
  newTitles: Record<ColumnType, string>;
  setNewTitles: (column: ColumnType, value: string) => void;
}) => {
  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
      {COLUMNS.map((column) => (
        <Column
          key={column}
          title={getColumnTitle(column)}
          column={column}
          cards={cards.filter(c => c.status === column)}
          setCards={setCards}
          onDragEnd={onDragEnd}
          adding={addingColumn === column}
          setAdding={(adding: boolean) => setAddingColumn(adding ? column : null)}
          newTitle={newTitles[column]}
          setNewTitle={(value: string) => setNewTitles(column, value)}
        />
      ))}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
    {COLUMNS.slice(0, 2).map((column) => (
      <div key={column} className="w-72 shrink-0">
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`font-medium transition-colors ${!darkMode ? 'text-neutral-700' : 'text-neutral-500'}`}>{getColumnTitle(column)}</h3>
          <span className={`rounded text-sm px-2 py-1 transition-colors ${!darkMode ? 'text-neutral-600 bg-neutral-200' : 'text-neutral-400 bg-neutral-800'}`}>-</span>
        </div>
        <div className={`h-full w-full flex flex-col items-center justify-center rounded border border-dashed transition-colors ${!darkMode ? 'border-neutral-300 bg-neutral-100/50' : 'border-neutral-700 bg-neutral-800/10'}`}>
          <Loader2 className={`animate-spin transition-colors ${!darkMode ? 'text-neutral-400' : 'text-neutral-600'}`} size={32} />
          <p className={`mt-4 text-sm transition-colors ${!darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>Loading...</p>
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ errors, onRetry }: { errors: string[], onRetry: () => void }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-lg border p-6 text-center transition-colors ${!darkMode ? 'border-red-300 bg-red-50' : 'border-red-500 bg-red-900/20'}`}>
    <p className={`mb-2 font-medium transition-colors ${!darkMode ? 'text-red-700' : 'text-red-400'}`}>Error loading tasks</p>
    <p className={`mb-4 text-sm transition-colors ${!darkMode ? 'text-red-600' : 'text-red-300'}`}>{errors[0]}</p>
    <button
      onClick={onRetry}
      className={`rounded px-4 py-2 text-sm font-medium transition-colors ${!darkMode ? 'bg-red-200 text-red-900 hover:bg-red-300' : 'bg-red-600 text-white hover:bg-red-500'}`}
    >
      Retry
    </button>
  </div>
);

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
};

const Column = ({ title, column, cards, setCards, onDragEnd, adding, setAdding, newTitle, setNewTitle }: ColumnProps) => {
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
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm("Delete this task?")) return;

    const card = cards.find(c => String(c.id) === cardId);
    if (!card) return;

    setCards(prev => prev.filter(c => String(c.id) !== cardId));
    try {
      await fetch(`/api/dev-tasks/${card.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
      setCards(prev => [...prev, card]); // Revert on failure
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    fetch(`/api/dev-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: "",
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

        if (responseJson && typeof responseJson === 'object' && responseJson.id) {
          const newCard = {
            title: responseJson.title || newTitle.trim(),
            description: "",
            status: column,
            assigned_to: null,
            id: responseJson.id,
          };
          setCards(prev => [...prev, newCard]);
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
    <div className="w-72 shrink-0 flex flex-col" data-column={column}>
      <div className={`mb-4 flex items-center justify-between sticky top-0 z-10 border-b px-3 py-3 transition-colors ${!darkMode ? 'bg-[var(--bg)] border-[var(--border-color)]' : 'bg-neutral-900 border-neutral-800'}`}>
        <h3 className="flex items-center gap-2 font-medium transition-colors">
          <ColumnIcon column={column} />
          {title}
        </h3>
        <span className={`rounded text-sm px-2 py-1 transition-colors ${!darkMode ? 'text-neutral-600 bg-neutral-200' : 'text-neutral-400 bg-neutral-800'}`}>
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
        {cards.map((c, index) => (
          <Card
            key={`${column}-${c.id}-${index}`}
            {...c}
            handleDragStart={handleDragStart}
            onDelete={handleDelete}
          />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard
          column={column}
          setCards={setCards}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          adding={adding}
          setAdding={setAdding}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

const ColumnIcon = ({ column, darkMode: localDarkMode = darkMode }: { column: ColumnType; darkMode?: boolean }) => {
  const icons: Record<ColumnType, React.ReactNode> = {
    pending: <span className={`text-xl transition-colors ${!localDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>✕</span>,
    todo: <span className={`text-xl transition-colors ${!localDarkMode ? 'text-yellow-600' : 'text-yellow-200'}`}>⚙</span>,
    in_progress: <span className={`text-xl transition-colors ${!localDarkMode ? 'text-blue-600' : 'text-blue-200'}`}>🔧</span>,
    completed: <span className={`text-xl transition-colors ${!localDarkMode ? 'text-emerald-600' : 'text-emerald-200'}`}>✓</span>,
  };
  return icons[column];
};

type CardProps = Omit<CardType, "assigned_to"> & {
  handleDragStart: (e: DragEvent, card: CardType) => void;
  onDelete: (id: string) => void;
};

const Card = ({ title, id, status, handleDragStart, onDelete }: CardProps) => {
  return (
    <motion.div
      layout
      layoutId={String(id)}
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
        handleDragStart(e, { title, id, status })
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`cursor-grab rounded border p-3 text-sm font-medium leading-relaxed group relative transition-colors ${!darkMode ? 'border-neutral-200 bg-white text-neutral-800' : 'border-neutral-700 bg-neutral-800 text-neutral-100'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1">{title}</p>
        <button
          onClick={() => onDelete(String(id))}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${!darkMode ? 'text-neutral-400 hover:text-red-600 hover:bg-red-100/50' : 'text-neutral-500 hover:text-red-400 hover:bg-red-900/20'}`}
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const DropIndicator = ({ beforeId, column }: { beforeId: string | null; column: ColumnType }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-1 h-0.5 w-full bg-[var(--color-dev)] opacity-0 rounded-full"
    />
  );
};

type AddCardProps = {
  column: ColumnType;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  newTitle: string;
  setNewTitle: (title: string) => void;
  adding: boolean;
  setAdding: (adding: boolean) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

const AddCard = ({
  column,
  setCards,
  newTitle,
  setNewTitle,
  adding,
  setAdding,
  handleSubmit,
}: AddCardProps) => {
  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className={`w-full rounded p-3 text-sm transition-colors resize-none ${!darkMode ? 'border border-neutral-300 bg-neutral-100 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300' : 'border border-[var(--color-dev)]/50 bg-[var(--color-dev)]/10 text-white placeholder-[var(--color-dev)]/50 focus:ring-[var(--color-dev)]/50'}`}
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
              onClick={() => setAdding(false)}
              className={`px-4 py-1.5 text-xs rounded transition-colors ${!darkMode ? 'text-neutral-500 hover:text-neutral-600 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium transition-colors ${!darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-[var(--color-dev)]/80 text-white hover:bg-[var(--color-dev)]'}`}
            >
              <span>Add</span>
              <Plus size={14} />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className={`flex w-full items-center gap-1.5 px-4 py-2 rounded border border-dashed transition-all ${!darkMode ? 'text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100 border-neutral-300' : 'text-neutral-500 hover:text-neutral-400 hover:bg-neutral-800/50 border-neutral-700'}`}
        >
          <span>Add task</span>
          <Plus size={14} />
        </motion.button>
      )}
    </>
  );
};
