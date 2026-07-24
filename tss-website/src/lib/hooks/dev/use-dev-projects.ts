import { useQuery, useMutation } from "@tanstack/react-query";

// Import typów z modułu DEV types
import type {
  DevProject,
  CreateProjectData,
  UpdateTaskStatusData,
  ProjectsWithTasksResponse,
} from "@/lib/types/dev-types";

/**
 * Hook dla pobierania listy projektów i tasków
 */
export function useDevProjects() {
  const query = useQuery<ProjectsWithTasksResponse>({
    queryKey: ["dev-projects"],
    staleTime: 10_000,
    retry: false,
  });

  return query;
}

/**
 * Hook dla dodawania/edycji/usuwania projektów
 */
export function useDevProjectsMutation() {
  return null;
}

/**
 * Hook dla zmiany statusu taska w projekcie
 */
export function useTaskStatusMutation() {
  return null;
}
