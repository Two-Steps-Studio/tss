"use client";

import React, { useState } from "react";
import { Tag, Plus, Calendar, User, Clock, Trash2 } from "lucide-react";

interface NewTaskModalProps {
  project: { id: number; name: string; color: string };
  taskData: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    tags: string[];
    assignedTo: number | null;
    status: "pending" | "in_progress" | "completed";
    dueDate?: string;
  };
  setTaskData: React.Dispatch<
    React.SetStateAction<
      {
        title: string;
        description: string;
        priority: "low" | "medium" | "high" | "critical";
        tags: string[];
        assignedTo: number | null;
        status: "pending" | "in_progress" | "completed";
        dueDate?: string;
      }
    >
  >;
  onSubmit: () => void;
  onClose: () => void;
}

const AVAILABLE_TAGS = ["feature", "bug", "chore", "docs", "design", "testing", "refactor"];

export default function NewTaskModal({
  project,
  taskData,
  setTaskData,
  onSubmit,
  onClose,
}: NewTaskModalProps) {
  const [tagsInput, setTagsInput] = useState("");

  const handleAddTag = () => {
    if (tagsInput.trim() && !taskData.tags.includes(tagsInput.trim())) {
      setTaskData(prev => ({ ...prev, tags: [...prev.tags, tagsInput.trim()] }));
      setTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Nowe zadanie w <span className="font-normal text-[var(--color-dev)]">{project.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tytuł</label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Np. Ulepsz system gamification"
              className="w-full px-4 py-3 text-lg rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)] focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Opis (opcjonalne)</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Szczegóły zadania..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priorytet</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" | "critical" }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)]"
              >
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
                <option value="critical">Krytyczny</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={taskData.status}
                onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value as "pending" | "in_progress" | "completed" }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)]"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">W toku</option>
                <option value="completed">Ukończone</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tagi <span className="text-gray-400 dark:text-gray-500 font-normal">(wpisz i zatwierdź Enter)</span>
            </label>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Np. feature, bug..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)]"
              />
              <button
                onClick={handleAddTag}
                className="p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[var(--color-dev)] hover:bg-[var(--color-dev)]/10 transition-colors"
                title="Dodaj tag"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {taskData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {taskData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-dev)]/10 text-[var(--color-dev)] text-sm border border-[var(--color-dev)]/20 capitalize"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Due date & assignee would go here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Data limit <span className="text-gray-400 dark:text-gray-500 font-normal">(opcjonalne)</span>
              </label>
              <input
                type="date"
                value={taskData.dueDate || ""}
                onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)] text-gray-500 dark:text-gray-400"
              />
            </div>

            {/* Assignee would go here */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Przypisz użytkownika <span className="text-gray-400 dark:text-gray-500 font-normal">(opcjonalne)</span>
              </label>
              <select
                value={taskData.assignedTo || ""}
                onChange={(e) => setTaskData(prev => ({ ...prev, assignedTo: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-dev)] text-gray-500 dark:text-gray-400"
              >
                <option value="">- Wybierz użytkownika -</option>
                {/* Lista użytkowników zostałaaby pobrana z API */}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={onSubmit}
            disabled={!taskData.title.trim()}
            className="px-6 py-3 rounded-xl bg-[var(--color-dev)] text-black font-semibold hover:bg-[var(--color-dev)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Dodaj zadanie <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
