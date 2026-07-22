/// dev/pages - Project overview with stats cards and project switcher integration


import { DevProject } from '@/types';
export default function Page() {
  return (
 <div className="container mx-auto p6 mt20 max-w7xl">
<h1>Projekty Programistyczne</h2>
<div><DevSwitch /></

<main>

<StatCards />

 </main>


 );

 }

interface StatCardProps {{
project: Project
completion_percentage number tasks_total all_done in-progress pending due_dates expected_completion_date date}} return (

// Display stats cards showing project info and completion %
)
}

function DevProjectSelector() {{ // Top-level switcher dropdown/list (already exists but integrate here)

}
}