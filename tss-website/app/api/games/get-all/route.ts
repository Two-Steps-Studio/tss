import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Not needed for GET requests
        },
      },
    }
  );

  try {
    // Pobieramy gry z bazy, sortowane po ID
    const { data: games, error } = await supabase
      .from("games")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("[API] Games get-all error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: games || [],
    });
  } catch (error) {
    console.error("[API] Games get-all unexpected error:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}