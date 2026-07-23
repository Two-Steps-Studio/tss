"use client"

import { useQuery, useMutation } from "@tanstack/react-query"; // React async state management for kanban board layout w projekcie oraz milestone trackingiem i roadmapzie timelineowym


/** Hook dla pobierania listy projektów z Supabase database */



export function useDevProjects() {
  const query = useQuery({                                                // TanStack Query cache management

    /** Pobierz wszystkie projekty wraz z taskami kanban board layout w projekcie oraz milestone trackingiem i roadmapzie timelineowym + pliki attachments   */


      .select(`id,name,description,status,priority,milestones!,files!{bucketName,file_key,size},technologies[],team_ids`, // Kanban board layout

    })  // TanStack Query cache management for async state (supabase database) - kanban board w projekcie oraz milestone trackingiem i roadmapzie timelineowym


/** Hook dla dodawania/edycji/usuwania projektów w kanban board layout */


export const addProjectMutation = useUpdateDevProjectMutat

  /** Użytkownik edytuje taski/projects/milestones (milestone deadline)   */

};


