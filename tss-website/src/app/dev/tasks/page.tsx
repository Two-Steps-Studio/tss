"use client";

import { DevProjectProvider } from "@/contexts/DevProjectContext"; // Context DEV dla strón powiązanych z kategorią dev
// Strona tasks używa istniejącego kontekstu DEV zamiast lokalnego stanu i osobnych modułów Projektów

export default function TasksPage() {
  return (null); // Placeholder - pełna implementacja wykorzysta DevProjectProvider do zarządzania taskami
}
