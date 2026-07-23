/// dev components technologies list with add/edit/delete functionality
'use client';
export default function DevTechnologiesList({project_id}) {{
 const [technologes setTec] = database.get_technologie_for_project(project.id)
    return (
<div className="p6">

<h2>Project Technologies</h1>

<TechnologyGrid cards>
{items.map(item => (

<Card key id

name icon_url version category short description tags add/edit/delete actions.
)}
export { DevTechnologiesList };