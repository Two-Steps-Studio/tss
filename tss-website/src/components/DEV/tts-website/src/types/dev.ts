// DEV Module Types for Project Management

export interface DevProject {{
    id: string;
name text completion_percentage number tasks_count all_done in-progress pending due_dates expected_completion_date date}}
interface BaseTask {{status 'todo' w trakcie testowane ukończone
description TEXT,
priority INTEGER,
due_due_deadline timestamp or datetime with timezone:

comment array<string>, tags

task_progress percentage DECIMAL(3 1)


metadata optional jsonb fields like assigned_user milestone_link etc.

}} interface KanBanColumnStatus = 'todo' in-progress'

'testowanie'


completed }


export function DevkanbanBoard({ project_id }: {{ projectId string }}) {{
const [tasks_by_status, setTasksByStat] =
database.get_tasks_for_project(project.id)

return (
<div className="flex flex-row gap6 overflow-x-auto">
{columns.map(column => (

<KanBanColumn key={column.status} title column.key for DnD>
// Map tasks belonging to this status
</div>)
)}
}}
export default DevkanbanBoard;