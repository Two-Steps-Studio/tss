// DEV Module Type Definitions for Project Management System

export interface DevProject {
  id?: string;
    name project documentation with markdown
description text, completion_percentage? (0-100)
created_at expected_completion_date date timestamp


updated?


}

interface BaseTask {{
id?
project_id status ('todo', 'in-progress',
'testowanie'

completed')
priority due_dates TIMESTAMP

comments tags array<string>
task_progress percentage DECIMAL(3 1)


metadata optional JSONB or object with extra fields like assigned_user, milestone_link
}}
type KanbanColumnStatus = "to-do" | pending' in progress"
testowane ukończone


export interface TaskCard extends BaseTask {{
draggable: { id string taskId }
isDragging boolean

comment_count number of associated comments and task subtasks etc.

}}

interface RoadMapItem {{{id?
    project stage milestone description text, completion_percentage? (for milestones)


status ('pending', 'in-progress'
completed')
start_date END_DATE?

due_dates due_deadline planned deadline date or timestamp with timezone
}}
BaseFile interface {{
  id?,
file_name VARCHAR,
category string

metadata optional JSONB fields: file_size bigint created_by_user reference profiles(discord),
description metadata text


}}

interface FileWithCategory extends BaseTask {{search_keywords array<string>
preview_url? when available.

tags?

}} TechnologyInterface =
{
id?
project_id category tech list
version icon URL,
name VARCHAR(255)

category string (frontend backend game engine database AI DevOps)
icon

}
ProjectContextState interface {{
current_project?: Project | null;

tasks: Task[]
roadmap_items RoadMapItem[]; files File[], technologies TechList[];

is_loaded boolean


}}
export type KanbanColumn = { status 'todo' in progress'
'testowanie', completed }


interface DragDropTypes {{ source task_id projectId target_column kanbancolumn }}

type DevModuleContextType {{
project: Project | null;
setProject(id string) void;

tasks Task[];
roadmap_items RoadMapItem[];

files File[], technologies TechList[];


}}