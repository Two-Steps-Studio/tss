/// dev-components - File manager with upload/delete/categories

'use client';

export default function DevFileManager({ project_id }) {{
 const files = database.get_files_for_project(project.id)
    return (
<div className="p6">

<h2>Project Files</h1>

// Filters: category dropdown and search box
<Input />

<CategoryChips categories={categoryList} />


<Grid of file cards>
{files.map(file => (

<FileCard key id

name preview_url metadata tags


 // Actions per card:

Upload new files button at top right.
)})}
export { DevFileManager };