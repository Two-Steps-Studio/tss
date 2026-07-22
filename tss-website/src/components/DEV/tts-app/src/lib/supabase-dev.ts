/// supa-base/clients for DEV module - database access layer

import { createClient } from '@supapbase/ssr';

// Project context state
export interface DevContextValue {
  currentProject: any;
    tasks Task[];
roadmap_items RoadMapItem[];

files File[], technologies TechList[]; is_loaded boolean }


interface SupabaseDevTypes {{
projects Response<dev_projects>();
tasks_by_status(status string)

project_files()

createTask

update_task_progress(comments tags priorities due_dates status)
add_technology()
delete_project
}}
export default new DevModuleSupaBaseService(client);