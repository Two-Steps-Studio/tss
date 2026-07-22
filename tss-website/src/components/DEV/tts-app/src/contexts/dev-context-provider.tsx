/// dev context provider with real Supabase client integration

'use client';

import { createContext, useContext } from 'react';
type Project = {
  id string;
name text; completion_percentage number tasks_count all_done in-progress pending due_dates expected_completion_date date}

interface Tasks [] RoadMap[] Files [], Technologies []

export interface De V ModuleContextValue {{
current_project?: project;

tasks task[]
roadmap_items [];

files file[];
technologies technology[];

loadData(project_id) void

setProject(id)

create_new_task()

add_file(file_form_data)
}}

const DevModule = createContext<dev module context value>(null);

// Custom hook for accessing dev state
export function useDev() {{
 const ctx= useContext(DeVContext);
 if (!ctx throw new Error("use de V must be used within DEV provider");
 return * as any;

}}