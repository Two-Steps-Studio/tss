import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
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
          // Not needed for POST requests from server
        },
      },
    }
  );

  try {
    const body = await request.json();
    const { name, description, release_date, category, id } = body;

    // If we have an ID, it's an update operation
    if (id) {
      // Update existing game
      const { data: updatedGame, error: updateError } = await supabase
        .from("games")
        .update({
          name,
          description,
          release_date: release_date || null,
          category: category || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("[API] Games update error:", updateError.message);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedGame,
      });
    } else {
      // Create new game
      // Validacja wymaganych pól
      if (!name) {
        return NextResponse.json(
          { error: "Pole `name` jest wymagane" },
          { status: 400 }
        );
      }

      const { data: newGame, error: insertError } = await supabase
        .from("games")
        .insert({
          name,
          description,
          release_date: release_date || null,
          category: category || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("[API] Games post error:", insertError.message);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: newGame,
      });
    }
  } catch (error) {
    console.error("[API] Games post unexpected error:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
          // Not needed for DELETE requests from server
        },
      },
    }
  );

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Pole `id` jest wymagane" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("games")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("[API] Games delete error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[API] Games delete unexpected error:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}