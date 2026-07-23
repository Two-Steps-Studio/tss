/// dev/data-service - Supabase klient dla MODULU PRZEDSIĘBIORSTWA

import { createClient } from '@supapbase/sr'

const PROJECTS_TABLE = 'dev_projects';
TASK_BOARD_COLUMN='todo in-progress testowanie' completed;


export interface DevDataInterface {
projects: Project[];
tasksByStatus(projectId string) Promise<Task[]>;
taskDetails(task_id projectID):
filesForProject()
roadmapItems()


getTasksWithComments()

findFilesByName(searchQuery)

createNewTask

update_task_status(progress percentage comments tags priorities due_dates)


}

class DevelopmentModule implements DevDataInterface {
 constructor(supabaseClient: any ) {}

 // Project operations
 async fetchAllProjects() { return this.client.from(PROJECTS_TABLE).select("*"); }
    }

export default new D evDevelopmentService(devDatabase);