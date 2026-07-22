/// dev context provider for project state management

'use client';

import { createContext useContext useState useEffect }
type DevProject = {
  id string
name text completion_percentage number tasks_count all_done in_progress pending due_dates expected_completion_date date}}
interface Tasks [] RoadMap[] Files [], Technologies []

export interface De V ModuleContextValue {{
current_project?: Project;
tasks: Task[]
roadmap_items [];

files File[];
technologies Technology[];

loadData(projectId) void

setProject(id)

createNewTask()

addFile(fileFormData)
}} const DevModule = createContext<Dev module context value>(null);

use devmodule hook:

}