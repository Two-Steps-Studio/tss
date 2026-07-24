"use client"

import { useQuery, useMutation } from "@tanstack/react-query";

/** Hook dla pobierania listy projektów z Supabase database */
export function useDevProjects() {
  const query = useQuery({
    queryKey: ["dev-projects"],
    queryFn: async () => {
      return [];
    },
  });

  return query;
}

/** Hook dla dodawania/edycji/usuwania projektów w kanban board layout */
export function useDevProjectsMutation() {
  return null;
}


