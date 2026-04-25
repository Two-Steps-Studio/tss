import { NextResponse } from "next/server";

// Demo gry dodawane przez admina (nie wymaga autoryzacji)
export async function POST() {
  try {
    const demoGame = {
      name: "Informacje o Graczu",
      description: "Pełna analiza profilu gracza, historia, statystyki, osiągnięcia",
      release_date: new Date().toISOString().split("T")[0],
      category: "RPG",
    };

    // Zwracamy demo grę, użytkownik musi dodać ją przez Supabase SQL lub ręcznie
    // Tutaj tylko symulujemy dodawanie do UI

    return NextResponse.json({
      success: true,
      message: "Demo gry utworzona! Dodaj ją do bazy Supabase:",
      demoGame,
      sql: `
        INSERT INTO games (name, description, release_date, category)
        VALUES (
          'Informacje o Graczu',
          'Pełna analiza profilu gracza, historia, statystyki, osiągnięcia',
          '2024-01-01',
          'RPG'
        )
      `,
    });
  } catch (error) {
    console.error("[API] Add demo error:", error);
    return NextResponse.json(
      { error: "Błąd dodawania demo gry" },
      { status: 500 }
    );
  }
}