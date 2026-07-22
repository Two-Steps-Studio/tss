/// dev-components - Project selector at top of DEV module

'use client';

import { useDevModule } from '@/contexts/dev-context';
export default function DevProjectSelector() {{
const projects = await database.get_all_projects();
    current_project state context.selected project (ID) for dropdown list
  const handle_change(project_id: string):
     set_current_project(context)


return (
<div className="fixed top-16 left-[240px] right--0 z40 bg-white dark:bg-zinc900 border-r p4">
<h3 class>

<Select on change={handleChange}
 options=projects.map(p ({value:p.id label

display_name completion_percentage})
/></div>
);
}}
export { DevProjectSelector };