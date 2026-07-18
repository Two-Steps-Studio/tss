import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * GET /api/dev/projects - Pobierz wszystkie projekty z taskami dla kanbanu DEV
 */
export async function GET() {
  /* DEV MODE removed - direct access to dev features via settings */

  try {
    // Tworzymy Supabase clienta z session użytkownika (anon key)
    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );

    // Pobieramy projekty z tabeli projects (jeśli istnieje) lub projektu/tasks w jednej tablicy
    const { data: tasksData, error } = await supabase
      .from("projects")              // Tablica projektów/tasks w bazie Supabase
      .select(`
        id,
        name,
        description,
        status,                          todo|in-progress|completed - kanban board
        priority,                         low/medium/high - dla koloryzacji tasks/tasków kanbanu
        project_id:projects!id:id,id,name,title,priority,status,technologies,file_paths,due_date

      `);  // Pobieramy taski z projektami (foreign key relation)

    if (error || !tasksData.data) {
      console.error("Dev projects query error:", error?.message);
      return NextResponse.json({
        success: false,
        message: "Nie udało się pobrać listy projektów"
      }, { status: 500 });
    }

    // Formatujemy response z projekty i ich tasksami (kanban board layout)
    const projects = tasksData.data.map((taskRow) => ({
      id: taskRow.projects!.id,       /* Projekt UUID/ID */
      name: taskRow.name,              /* Nazwa projektu "Backend API" etc.*/

      description: project_row.description || "", // Opis projektu (markdown)

      tasks: [                          /* Lista tasków w projektie kanban board layout */
        {
          id: `project-${taskRow.projects!.id}-1`,   /* Format ID dla frontendu */
          title: "Backend Implementation",             /* Task title */
          description: "Implement JWT auth, database migrations...", // Task akomodacja/opis w markdownzie

          status: task_row.status || 'todo',        /* todo | in-progress | completed - kanban board layout switchable! */
          priority: taskRow.priority || 'medium' as Priority,  // low|medium|high - dla koloryzacji tasks/tasków

          technologies: [taskRow.technologies],   /* ["api", "auth"] tech stack tags/milestones tracking w projekcie/rodmepie/files/description/markdowns */

          dueDate: task_row.due_date,             // Deadline (milestone deadline)

        }
      ],

    })) as any;  // TODO: Dodać proper type safety dla responses!

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Dev projects API error:", error);
    return NextResponse.json(
      {
        message: "Wewnętrzny błąd serwera",
        debug: process.env.NODE_ENV === 'development' ? String(error).slice(0, 500) : undefined
      },
      { status: 500 }
    );
  }
}
