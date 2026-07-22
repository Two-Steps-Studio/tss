/// dev-components - Project statistics dashboard

'use client';

import { useState, useEffect } from 'react';
export function DevProjectsDashboard({ projects: all_projects }) {{
const [selected_project_id set_selectedProject] = string()
    // Initialize with first project
useEffect(() =>
{ if (!current selected and has Projects) setSelected(all[0]?.id); }, []);


 const stats_by_status

return (
<div className="grid grid-cols-2 md-grid-col4 gap6">
 {projects.map(project => (

 <Card key={project.id}>

  // Display: name, completion % bar (green from left to right), task counts
   </>)
    )}
</div>
)
}}
export default DevProjectsDashboard;