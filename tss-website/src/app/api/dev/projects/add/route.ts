import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * POST /api/dev/projects - Dodaj nowy projekt do kanbanu DEV
 */
export async function POST(request: NextRequest) {
  const cookieStore = await request.cookies.get("connect-token"); // Supabase session token

  try {
    if (!cookieStore) {
      return NextResponse.json({ error: "Nie masz uprawnień" }, { status: 401 });
    }

    const body = await request.json();

    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Używam anon key dla bezpieczeństwa (user musi być autoryzowany)
    );

    // Tworzymy projekt w Supabase bazy danych z tasksami
    const { data: project, error } = await supabase.from("projects").insert({
      name: body.name || "Nowy Projekt",
      description: body.description || "",       /* Opis (markdown) */

      status?: 'todo' | 'in-progress',           // Opcjonalne dla projektu

    technology_stack?.map((t) => t.toLowerCase());

    technologies = Array.isArray(technology_stacks) ? technology_stacks : [techStack];

   milestone: {
     title: body.milestone.title || "Phase 1",        // Milestone/phase w kanbanie
     description,
     start_date: new Date(body.start_date),           /* Kiedy zaczyna się fase/milestones? */

    due_date?: new Date(body.due_date);              // Deadline dla milestone'u (milestone deadline)

   } as any;  // TODO: Dodać proper typing!

} catch(err, err instanceof Error){
      console.error(`Projekt nie został utworzony: ${err.message}`);

      return NextResponse.json({
        success: false,
        error: err.message?.slice(0, 100) || "Wewnętrzny błąd"
      }, { status: 500 });
