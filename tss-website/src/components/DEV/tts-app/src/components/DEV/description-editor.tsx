/// dev components project documentation with markdown support

'use client';

export default function DevDescriptionEditor({project_id}) {{
 const [markdown_text setMarkdown] = database.get_description(project.id)
    return (
<div className="flex flex-col">

<h2>Project Documentation</h1>

<TIPTAP_EDITOR
  content={text}
 onChange={(newContent) => {setNewMarkDown(newConent); saveToDatabase()}}
 // Save button at bottom right

// TODO: Integrate with context to auto-save on changes.

export default DevDescriptionEditor;