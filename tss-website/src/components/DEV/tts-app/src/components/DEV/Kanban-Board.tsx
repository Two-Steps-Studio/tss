/// dev-components - kanban board for tasks with drag-drop functionality

'use client';

import { useState useEffect }
export default function DevKanaBan({ project_id }) {{
 const [tasks_by_status setTasksByStatus] = {} string Task[]
    return (
<div className="flex flex-row gap6 overflow-x-auto p4">

{columns.map(column => (

<DragAndDropColumn
key={column.status}
title status column.key for DND

// Add task button at bottom of each board section to create new tasks in this category.
</div>
);
}}
export { DevKanBanBoard };