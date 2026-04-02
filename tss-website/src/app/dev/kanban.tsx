"use client";

import React, { useEffect, useState, DragEvent, FormEvent } from "react";
import { Plus, Trash2, Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type ColumnType = "backlog" | "todo" | "doing" | "done";

type CardType = {
  title: string;
  id: number | string;
  status: ColumnType;
  description?: string;
  assigned_to?: number;
};

const COLUMNS: ColumnType[] = ["backlog", "todo", "doing", "done"];

const getColumnTitle = (column: ColumnType): string => {
  const titles: Record<ColumnType, string> = {
    backlog: "Backlog",
    todo: "TODO",
    doing: "Doing",
    done: "Done",
  };
  return titles[column];
};

export default function KanbanBoard() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

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

  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", String(card.id));
  };

  const handleDragEnd = async (e: DragEvent) => {
    const cardId = String(e.dataTransfer.getData("cardId"));
    setActive(false);

    const indicators = getIndicators(e);
    const { element } = getNearestIndicator(e, indicators);

    const beforeId = element.dataset.before || null;

    if (beforeId && beforeId !== cardId) {
      const newCards = reorderCards([...cards], cardId, beforeId);
      setCards(newCards);

      // Update w bazie
      const card = newCards.find(c => c.id === cardId);
      if (card) {
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
          setCards(cards);
        }
      }
    }

    clearHighlights();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const reorderCards = (cards: CardType[], draggedCardId: string, newBeforeId: string | null) => {
    const cardIndex = cards.findIndex(c => c.id === draggedCardId);
    if (newBeforeId === null) return [...cards].reverse();

    const newCardIndex = cards.findIndex(c => c.id === newBeforeId);
    if (newCardIndex === -1) return cards;

    const removed = cards.splice(cardIndex, 1)[0];
    const newCards = [...cards];
    newCards.splice(newCardIndex, 0, removed);
    return newCards;
  };

  const clearHighlights = () => {
    document.querySelectorAll("[data-highlighted='true']").forEach(el => {
      el.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();
    clearHighlights();
    const el = getNearestIndicator(e, indicators);
    if (el?.style) el.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
    return el;
  };

  const getIndicators = (els?: HTMLElement[]) => {
    return (
      els ||
      Array.from(
        document.querySelectorAll("[data-column]")
      ) as unknown as HTMLElement[]
    );
  };

  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Task Table</h1>
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
        <Board />
      )}
    </div>
  );
}

const Board = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const response = await fetch("/api/dev-tasks");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setErrors(["Failed to load tasks. Please try again."]);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (errors.length) {
    return <ErrorState errors={errors} onRetry={fetchCards} />;
  }

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
      {COLUMNS.map((column) => (
        <Column
          key={column}
          title={getColumnTitle(column)}
          column={column}
          cards={cards.filter(c => c.status === column)}
          setCards={setCards}
          active={active}
          setActive={setActive}
        />
      ))}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
    <div className="w-72 shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-neutral-500">Backlog</h3>
        <span className="rounded text-sm text-neutral-400 bg-neutral-800 px-2 py-1">-</span>
      </div>
      <div className="h-full w-full flex flex-col items-center justify-center rounded border border-dashed border-neutral-700 bg-neutral-800/10">
        <Loader2 className="animate-spin text-neutral-600" size={32} />
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
      </div>
    </div>
    <div className="w-72 shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-yellow-200">TODO</h3>
        <span className="rounded text-sm text-neutral-400 bg-neutral-800 px-2 py-1">-</span>
      </div>
      <div className="h-full w-full flex flex-col items-center justify-center rounded border border-dashed border-neutral-700 bg-neutral-800/10">
        <Loader2 className="animate-spin text-neutral-600" size={32} />
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
      </div>
    </div>
  </div>
);

const ErrorState = ({ errors, onRetry }: { errors: string[], onRetry: () => void }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="rounded border border-red-500 bg-red-900/20 px-6 py-4 text-center">
      <p className="mb-2 text-red-400 font-medium">Error loading tasks</p>
      <p className="mb-4 text-sm text-red-300">{errors[0]}</p>
      <button
        onClick={onRetry}
        className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
      >
        Retry
      </button>
    </div>
  </div>
);

type ColumnProps = {
  title: string;
  column: ColumnType;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  active: boolean;
  setActive: (active: boolean) => void;
};

const Column = ({
  title,
  column,
  cards,
  setCards,
  active,
  setActive,
}: ColumnProps) => {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", String(card.id));
  };

  const handleDragEnd = async (e: DragEvent) => {
    const cardId = String(e.dataTransfer.getData("cardId"));
    setActive(false);

    const indicators = getIndicators(e);
    const { element } = getNearestIndicator(e, indicators);

    const beforeId = element.dataset.before || null;

    if (beforeId && beforeId !== cardId) {
      const newCards = reorderCards([...cards], cardId, beforeId);
      setCards(newCards);

      const cardToTransfer = newCards.find(c => String(c.id) === cardId);
      if (cardToTransfer) {
        try {
          await fetch(`/api/dev-tasks/${cardToTransfer.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: cardToTransfer.title,
              description: cardToTransfer.description || "",
              status: cardToTransfer.status,
              assigned_to: cardToTransfer.assigned_to,
            }),
          });
        } catch (error) {
          console.error("Failed to update card in DB:", error);
          setCards(cards);
        }
      }
    }

    clearHighlights();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = () => {
    const indicators = getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();
    clearHighlights();
    const el = getNearestIndicator(e, indicators);
    if (el?.style) el.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
    return el;
  };

  const getIndicators = (els?: HTMLElement[]) => {
    return (
      els ||
      Array.from(
        document.querySelectorAll(
          `[data-column="${column}"]`
        )
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
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
    }).then(async (response) => {
      const responseJson = await response.json();

      // Jeśli API zwróciło błąd, wyświetl go
      if (responseJson.error) {
        console.error("Failed to create card:", responseJson.error);
        setAdding(false);
        return;
      }

      // Dodaj nowo utworzone zadanie do lokalnego stanu
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
    }).catch((error) => {
      console.error("Failed to add card:", error);
      setAdding(false);
    });
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm("Delete this task?")) return;

    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    setCards(prev => prev.filter(c => c.id !== cardId));
    await fetch(`/api/dev-tasks/${card.id}`, {
      method: "DELETE",
    });
  };

  return (
    <div className="w-72 shrink-0 flex flex-col" data-column={column}>
      <div className="mb-4 flex items-center justify-between sticky top-0 bg-neutral-900 py-3 z-10 border-b border-neutral-800">
        <h3 className="font-medium flex items-center gap-2">
          <ColumnIcon column={column} />
          {title}
        </h3>
        <span className="rounded text-sm text-neutral-400 bg-neutral-800 px-2 py-1">
          {cards.length}
        </span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="h-full w-full flex flex-col gap-3 p-2 rounded-lg bg-transparent"
        data-before="null"
      >
        {cards.map((c, index) => (
          <Card key={`${column}-${c.title.substring(0, 10)}-${index}`} {...c} handleDragStart={handleDragStart} onDelete={handleDelete} />
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

const ColumnIcon = ({ column }: { column: ColumnType }) => {
  const icons: Record<ColumnType, React.ReactNode> = {
    backlog: <span className="text-neutral-500 text-xl">✕</span>,
    todo: <span className="text-yellow-200 text-xl">⚙</span>,
    doing: <span className="text-blue-200 text-xl">🔧</span>,
    done: <span className="text-emerald-200 text-xl">✓</span>,
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
      layoutId={id}
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
        handleDragStart(e, { title, id, status })
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing group relative"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-neutral-100 font-medium leading-relaxed">{title}</p>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-all"
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
  const handleAdd = () => {
    if (!newTitle.trim()) return;

    const card = {
      title: newTitle.trim(),
      description: "",
      status: column,
      assigned_to: null,
    };

    fetch(`/api/dev-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    }).then(async (response) => {
      const responseJson = await response.json();

      // Jeśli API zwróciło błąd, wyświetl go
      if (responseJson.error) {
        console.error("Failed to create card:", responseJson.error);
        setAdding(false);
        return;
      }

      // Dodaj nowo utworzone zadanie do lokalnego stanu
      if (responseJson && typeof responseJson === 'object' && responseJson.id) {
        const newCard = {
          title: responseJson.title || card.title,
          description: responseJson.description || "",
          status: responseJson.status || card.status,
          assigned_to: responseJson.assigned_to || card.assigned_to,
          id: responseJson.id,
        };
        setCards(prev => [...prev, newCard]);
      }

      setNewTitle("");
      setAdding(false);
    }).catch((error) => {
      console.error("Failed to add card:", error);
      setAdding(false);
    });
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-[var(--color-dev)]/50 bg-[var(--color-dev)]/10 p-3 text-sm text-white placeholder-[var(--color-dev)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)]/50 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-1.5 text-xs text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleAdd}
              className="flex items-center gap-1.5 rounded bg-[var(--color-dev)]/80 px-4 py-1.5 text-xs text-white hover:bg-[var(--color-dev)] transition-colors"
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
          className="flex w-full items-center gap-1.5 px-4 py-2 text-xs text-neutral-500 hover:text-neutral-400 hover:bg-neutral-800/50 rounded border border-dashed border-neutral-700 transition-colors"
        >
          <span>Add task</span>
          <Plus size={14} />
        </motion.button>
      )}
    </>
  );
}
