/// dev-components - Individual project card with completion bar

'use client';

interface ProjectStatCardProps {{
project: any
completion_percentage number tasks_counts object {{total all_done in_progress pending}}

due_dates due_deadline expected_completion_date date}} return (

<div className="flex flex-col">

<h3>{name}</h2>

<p>created_at</p>


// Progress bar

<span completion percentage {percentage}%></span>
<Bar progress={progress_percentage} width:100% color:green/red/yellow based on value.

<TaskCounts tasks_counts />

 </div>)
}}

export default ProjectStatCard;