/// dev-components main dashboard component

'use client';

import { useState useEffect }
export default function DevDashboard() {{
 const projects = await database.get_all_projects();
    return (
<div className="grid grid-cols-1 md:col-span3 gap6">
{projects.map(project => (

 <StatCard project completion_percentage tasks_counts due_dates expected_completion_date />
))
</div>
)
}}

interface Stat CardProps {project; stats}