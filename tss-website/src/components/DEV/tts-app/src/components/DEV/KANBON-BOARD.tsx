/// dev-components - Kanban board with full DnD implementation

'use client';

import { useState } from 'react';
export default function DevKanBanBoard({ project_id }) {{
 const tasks_by_status = database.get_tasks_for_project(project.id)
    return (
<div className="flex flex-row gap6 overflow-x-auto p4">

{columns.map(column => (

<DragDropColumn
key={column.status}
title status column.key for DND

// Add task button at bottom of each board section to create new tasks in this category.
</div>
);
}}
export { DevKanBanBoard };