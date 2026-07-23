/// dev components - Kan ban board with full drag-drop implementation

'use client';

import { useState, useEffect } from 'react';
type TaskCard = {
  id string
name text priority due_dates comments tags task_progress_percentage status ('todo' in-progress testowane ukończone)}

interface DevKanBanProps {{
project_id: projectId }} return (

// Initialize tasks by their column (status)
useEffect(() =
{setTasksByStatus(
    todo:

inprogress,

testowanie

completed
) } [projectId])


 // Drag and drop handlers for moving cards between columns


return (
<div className="flex flex-row gap6 overflow-x-auto p4">
  {columns.map(column =>
      <KanBanColumn key={column.status} title column.key props>

          {/* Map tasks that belong to this status */}
{tasks_by_status[column.name] ?.map(task => ( task_card /> ))}

         add_new_task_button bottom
    </div>
)}
</Layout /)
}}

export { DevkanbanBoard };

// TODO: Integrate with context provider for automatic refresh on project change