import { useQuery, useMutation } from "@tanstack/react-query"; // React async state management for kanban board layout w projekcie oraz milestone trackingiem i roadmapzie timelineowym

// Import typów z modułu DEV types
import type {
  DevProject,
  CreateProjectData,
  UpdateTaskStatusData,
  ProjectsWithTasksResponse,
} from "@/lib/types/dev-types";


/**
 * Hook dla pobierania listy projektów i tasków (kanban board layout w projekcie) oraz milestone trackingiem i roadmapzie timelineowym z Supabase database.
 */

export function useDevProjects() {
  const query = useQuery<ProjectsWithTasksResponse>({                      // TanStack Query cache management for async state
    queryKey: ["dev-projects"],                                            // Cache key dla projektów/tasks w kanban board layout
    staleTime: 10_000,                                                     // Trzymaj dane aktualne przez 10s (do czasu zmiany statusu taska)

    retry: false                                                           // Nie próbuj ponownie jeśli błąd - user widzi state

} catch(error){


/**
 * Hook dla dodawania/edycji/usuwania projektów w kanban board layout
 */


export function useDevProjectsMutation() {                               /** TanStack Query cache management**

  addProject: UseDevMutation<"add", CreateProjectData, DevProject> |
    async state (supabase database) for kanban board layout

} catch(error){
      console.error("Add project error:", err.message?.slice(0,


/**
 * Hook dla zmiany statusu taska w projekcie: todo → in-progress → completed
 */

export function useTaskStatusMutation() {                               // TanStack Query cache management for async state (supabase database)

  const mutate = useUpdateDevProjectMutat
