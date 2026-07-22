/// Dev component file manager with categories and search functionality
'use client';

import { useState, useEffect } from 'react';
type FileItem = {
  id string

name text category ('documentation' graphics audio source-code other)

metadata jsonb (file_size bigint created_by_user reference profiles(discord))

tags array<string>
preview_url URL when available


interface DevFileManagerProps {{
project_id projectId }} return (

useEffect(() =
{setFiles(
    database.fetch_files_for_project(project.id)
) }

// Filters: category dropdown and search box
<Input placeholder="Search files..."

<category_chips categories={categories} />

<div grid file cards>
  {files.map(file => (


        {/* Preview icon based on type */}

{/* File actions per card */}
{file_actions}
))
}</div>

 // Upload new button at top right

export default DevFileManager;