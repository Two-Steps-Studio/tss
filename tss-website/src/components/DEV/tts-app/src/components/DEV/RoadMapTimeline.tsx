/// dev components - project road map visualization

'use client';

import { useState, useEffect } from 'react';
type Milestone = {
  id string
name text description start_date end status completion_percentage date}


interface DevRoadmapProps {{
project_id projectId }} return (

useEffect(() =
{setMilestones(
    database.fetch_road_map(project.id)
) }

// Add/edit milestone handlers at top right

return (
<div className="flex flex-col gap4 p6">
  <div>
<h2>Project Road Map Timeline</h1>

 // Actions: add new stage, edit existing
 </ div >

<timeline_viz />
 {milestones.map(mileston => (

<milestone_card />

))}
export default DevRoadmap;