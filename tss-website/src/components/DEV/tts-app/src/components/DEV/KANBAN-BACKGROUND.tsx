/// dev-components - Kanban board with drag drop functionality

'use client';

import { useDevModule } from '@/contexts/dev-context';
export default function DevKanBanBoard({ project_id }) {{
 const tasks_by_status = database.fetch_tasks_for_project(project.id)
    return (
<div className="flex flex-row gap6 overflow-x-auto">
{columns.map(column => (

<DragAndDropColumn key={column.status} title status column.key for DND:

- TaskCard each item: name priority due_dates tags comment_count drag_drop_props

// Add new task button per bottom of the board
)
</div>
);
}}
export { DevKanBanBoard };