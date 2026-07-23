import { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectData, Task, RoadmapItem, ProjectFile, Technology } from '@/types/dev';

const STORAGE_KEY = 'dev-projects';
const ACTIVE_KEY = 'dev-active-project';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function nowDate(): string {
  return new Date().toISOString().split('T')[0];
}

function createSampleProject1(): ProjectData {
  const projectId = 'proj-1';
  return {
    project: {
      id: projectId,
      name: 'TSS Dashboard',
      description: 'Panel zarządzania systemem TSS z modułami CRM, CMS, Dev i AI.',
      createdAt: '2026-01-15',
      plannedEndDate: '2026-12-31',
      status: 'active',
    },
    tasks: [
      { id: generateId(), projectId, title: 'Zaprojektować architekturę', description: 'Opracować diagramy C4 i wybrać stack.', status: 'done', priority: 'high', dueDate: '2026-02-01', assignee: 'Marcin', labels: ['architektura'], progress: 100, comments: [], createdAt: '2026-01-16' },
      { id: generateId(), projectId, title: 'Implementacja autentykacji', description: 'OAuth2 + JWT, logowanie przez Discord.', status: 'done', priority: 'critical', dueDate: '2026-03-01', assignee: 'Marcin', labels: ['backend', 'security'], progress: 100, comments: [], createdAt: '2026-01-20' },
      { id: generateId(), projectId, title: 'Moduł CRM', description: 'Zarządzanie klientami, leadami i kampaniami.', status: 'in-progress', priority: 'high', dueDate: '2026-06-30', assignee: 'Marcin', labels: ['frontend', 'crm'], progress: 65, comments: [], createdAt: '2026-02-10' },
      { id: generateId(), projectId, title: 'Moduł AI', description: 'Integracja z LLM, agenci, automatyzacje.', status: 'in-progress', priority: 'high', dueDate: '2026-07-30', assignee: 'Marcin', labels: ['ai', 'backend'], progress: 40, comments: [], createdAt: '2026-03-05' },
      { id: generateId(), projectId, title: 'Testy E2E', description: 'Cypress + Playwright dla krytycznych ścieżek.', status: 'testing', priority: 'medium', dueDate: '2026-08-15', assignee: 'Marcin', labels: ['qa'], progress: 80, comments: [], createdAt: '2026-04-01' },
      { id: generateId(), projectId, title: 'Dokumentacja API', description: 'OpenAPI + Swagger UI.', status: 'todo', priority: 'medium', dueDate: '2026-09-01', labels: ['docs'], progress: 0, comments: [], createdAt: '2026-05-01' },
      { id: generateId(), projectId, title: 'Deployment CI/CD', description: 'GitHub Actions + Docker + VPS.', status: 'todo', priority: 'high', dueDate: '2026-10-01', labels: ['devops'], progress: 0, comments: [], createdAt: '2026-05-10' },
    ],
    roadmap: [
      { id: generateId(), projectId, name: 'Faza 1: Planowanie', description: 'Analiza wymagań, wybór technologii, architektura.', startDate: '2026-01-15', endDate: '2026-02-28', status: 'completed', progress: 100 },
      { id: generateId(), projectId, name: 'Faza 2: Core', description: 'Autentykacja, baza danych, podstawowe API.', startDate: '2026-03-01', endDate: '2026-04-30', status: 'completed', progress: 100 },
      { id: generateId(), projectId, name: 'Faza 3: Moduły', description: 'CRM, CMS, DEV, AI jako osobne moduły.', startDate: '2026-05-01', endDate: '2026-08-31', status: 'in-progress', progress: 55 },
      { id: generateId(), projectId, name: 'Faza 4: Integracje', description: 'Discord, GitHub, Jira, webhooks.', startDate: '2026-09-01', endDate: '2026-10-31', status: 'planned', progress: 0 },
      { id: generateId(), projectId, name: 'Faza 5: Launch', description: 'Testy obciążeniowe, monitoring, release.', startDate: '2026-11-01', endDate: '2026-12-31', status: 'planned', progress: 0 },
    ],
    files: [
      { id: generateId(), projectId, name: 'architektura.md', size: '12 KB', category: 'documentation', uploadedAt: '2026-01-20' },
      { id: generateId(), projectId, name: 'logo.svg', size: '45 KB', category: 'graphics', uploadedAt: '2026-02-01' },
      { id: generateId(), projectId, name: 'db-schema.sql', size: '8 KB', category: 'source-code', uploadedAt: '2026-03-10' },
      { id: generateId(), projectId, name: 'theme-audio.mp3', size: '2.1 MB', category: 'audio', uploadedAt: '2026-04-05' },
      { id: generateId(), projectId, name: 'README.md', size: '4 KB', category: 'documentation', uploadedAt: '2026-01-16' },
    ],
    description: `# TSS Dashboard

## Opis projektu

TSS Dashboard to centralny panel zarządzania systemem **TSS (The Secret Society)**.

## Cel

Zbudowanie nowoczesnego, modułowego systemu zarządzania z AI.

## Funkcje

- CRM — zarządzanie klientami
- CMS — zarządzanie treścią
- DEV — zarządzanie projektami
- AI — agenci i automatyzacje

## Technologie

React, TypeScript, Tailwind CSS, shadcn/ui, Node.js, PostgreSQL.`,
    technologies: [
      { id: generateId(), projectId, name: 'React', icon: 'Code2', version: '19.2', category: 'Frontend', description: 'Biblioteka UI' },
      { id: generateId(), projectId, name: 'TypeScript', icon: 'FileCode', version: '5.9', category: 'Frontend', description: 'Typowanie statyczne' },
      { id: generateId(), projectId, name: 'Tailwind CSS', icon: 'Palette', version: '3.4', category: 'Frontend', description: 'Utility-first CSS' },
      { id: generateId(), projectId, name: 'Node.js', icon: 'Server', version: '22', category: 'Backend', description: 'Runtime JavaScript' },
      { id: generateId(), projectId, name: 'PostgreSQL', icon: 'Database', version: '16', category: 'Database', description: 'Relacyjna baza danych' },
      { id: generateId(), projectId, name: 'OpenAI', icon: 'Brain', version: 'GPT-4o', category: 'AI', description: 'Model LLM' },
      { id: generateId(), projectId, name: 'Docker', icon: 'Container', version: '27', category: 'DevOps', description: 'Konteneryzacja' },
    ],
  };
}

function createSampleProject2(): ProjectData {
  const projectId = 'proj-2';
  return {
    project: {
      id: projectId,
      name: 'Game: Shadow Realms',
      description: 'RPG akcji z proceduralnym generowaniem światów i systemem AI-NPC.',
      createdAt: '2025-08-01',
      plannedEndDate: '2027-06-01',
      status: 'active',
    },
    tasks: [
      { id: generateId(), projectId, title: 'Silnik graficzny', description: 'Własny renderer oparty na Vulkan.', status: 'in-progress', priority: 'critical', dueDate: '2026-03-01', assignee: 'Marcin', labels: ['engine'], progress: 30, comments: [], createdAt: '2025-08-10' },
      { id: generateId(), projectId, title: 'System walki', description: 'Kombosy, umiejętności, balans.', status: 'todo', priority: 'high', dueDate: '2026-06-01', labels: ['gameplay'], progress: 0, comments: [], createdAt: '2025-09-01' },
      { id: generateId(), projectId, title: 'AI NPC', description: 'Behavior trees + LLM dla dialogów.', status: 'in-progress', priority: 'high', dueDate: '2026-09-01', labels: ['ai'], progress: 45, comments: [], createdAt: '2025-10-01' },
      { id: generateId(), projectId, title: 'Proceduralne światy', description: 'Generowanie dungeonów, biomów, questów.', status: 'todo', priority: 'medium', dueDate: '2026-12-01', labels: ['procgen'], progress: 0, comments: [], createdAt: '2025-11-01' },
      { id: generateId(), projectId, title: 'Soundtrack', description: 'Dynamiczna muzyka reagująca na grę.', status: 'testing', priority: 'medium', dueDate: '2026-04-01', labels: ['audio'], progress: 90, comments: [], createdAt: '2025-12-01' },
    ],
    roadmap: [
      { id: generateId(), projectId, name: 'Pre-production', description: 'GDD, concept art, tech demo.', startDate: '2025-08-01', endDate: '2025-12-31', status: 'completed', progress: 100 },
      { id: generateId(), projectId, name: 'Alpha', description: 'Core gameplay loop, pierwszy poziom.', startDate: '2026-01-01', endDate: '2026-06-30', status: 'in-progress', progress: 35 },
      { id: generateId(), projectId, name: 'Beta', description: 'Wszystkie poziomy, balans, QA.', startDate: '2026-07-01', endDate: '2026-12-31', status: 'planned', progress: 0 },
      { id: generateId(), projectId, name: 'Release', description: 'Steam, marketing, day-one patch.', startDate: '2027-01-01', endDate: '2027-06-01', status: 'planned', progress: 0 },
    ],
    files: [
      { id: generateId(), projectId, name: 'gdd.pdf', size: '2.4 MB', category: 'documentation', uploadedAt: '2025-08-05' },
      { id: generateId(), projectId, name: 'concept-art.zip', size: '156 MB', category: 'graphics', uploadedAt: '2025-09-10' },
      { id: generateId(), projectId, name: 'combat-prototype.cpp', size: '24 KB', category: 'source-code', uploadedAt: '2025-10-20' },
      { id: generateId(), projectId, name: 'ambient-theme.wav', size: '18 MB', category: 'audio', uploadedAt: '2025-11-15' },
    ],
    description: `# Shadow Realms

## Opis

RPG akcji w mrocznym fantasy świecie z proceduralnym generowaniem zawartości.

## Unikalne cechy

- **Proceduralne światy** — każda rozgrywka jest inna
- **AI NPC** — postacie pamiętają gracza i reagują na jego wybory
- **Dynamiczna muzyka** — soundtrack dostosowuje się do akcji

## Silnik

Własny silnik oparty na Vulkan z systemem ray tracing.
`,
    technologies: [
      { id: generateId(), projectId, name: 'C++', icon: 'FileCode', version: '23', category: 'Game Engine', description: 'Język silnika' },
      { id: generateId(), projectId, name: 'Vulkan', icon: 'Layers', version: '1.3', category: 'Game Engine', description: 'API graficzne' },
      { id: generateId(), projectId, name: 'Lua', icon: 'Terminal', version: '5.4', category: 'Game Engine', description: 'Scripting' },
      { id: generateId(), projectId, name: 'FMOD', icon: 'Music', version: '2.02', category: 'Audio', description: 'Audio middleware' },
      { id: generateId(), projectId, name: 'Blender', icon: 'Box', version: '4.2', category: 'Graphics', description: 'Modelowanie 3D' },
    ],
  };
}

function loadProjects(): Record<string, ProjectData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, ProjectData>;
      if (Object.keys(parsed).length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const p1 = createSampleProject1();
  const p2 = createSampleProject2();
  const map: Record<string, ProjectData> = {
    [p1.project.id]: p1,
    [p2.project.id]: p2,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return map;
}

export function useDevStore() {
  const [projects, setProjects] = useState<Record<string, ProjectData>>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_KEY);
      if (saved && loadProjects()[saved]) return saved;
    } catch { /* ignore */ }
    const first = Object.keys(loadProjects())[0];
    return first ?? '';
  });

  const persist = useCallback((next: Record<string, ProjectData>) => {
    setProjects(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setActiveProject = useCallback((id: string) => {
    setActiveProjectId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const addProject = useCallback((project: Project) => {
    const data: ProjectData = {
      project,
      tasks: [],
      roadmap: [],
      files: [],
      description: `# ${project.name}\n\nOpis projektu...`,
      technologies: [],
    };
    setProjects(prev => {
      const next = { ...prev, [project.id]: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setActiveProjectId(project.id);
    localStorage.setItem(ACTIVE_KEY, project.id);
  }, [setActiveProject]);

  const updateProject = useCallback((project: Project) => {
    setProjects(prev => {
      if (!prev[project.id]) return prev;
      const next = { ...prev, [project.id]: { ...prev[project.id], project } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      const ids = Object.keys(next);
      if (ids.length > 0) {
        setActiveProjectId(ids[0]);
        localStorage.setItem(ACTIVE_KEY, ids[0]);
      } else {
        setActiveProjectId('');
        localStorage.removeItem(ACTIVE_KEY);
      }
      return next;
    });
  }, []);

  const getActiveProjectData = useCallback((): ProjectData | null => {
    return projects[activeProjectId] ?? null;
  }, [projects, activeProjectId]);

  const updateActiveProjectData = useCallback((data: Partial<ProjectData>) => {
    if (!activeProjectId) return;
    setProjects(prev => {
      if (!prev[activeProjectId]) return prev;
      const next = { ...prev, [activeProjectId]: { ...prev[activeProjectId], ...data } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [activeProjectId]);

  const updateActiveTasks = useCallback((tasks: Task[]) => {
    updateActiveProjectData({ tasks });
  }, [updateActiveProjectData]);

  const updateActiveRoadmap = useCallback((roadmap: RoadmapItem[]) => {
    updateActiveProjectData({ roadmap });
  }, [updateActiveProjectData]);

  const updateActiveFiles = useCallback((files: ProjectFile[]) => {
    updateActiveProjectData({ files });
  }, [updateActiveProjectData]);

  const updateActiveTechnologies = useCallback((technologies: Technology[]) => {
    updateActiveProjectData({ technologies });
  }, [updateActiveProjectData]);

  const updateActiveDescription = useCallback((description: string) => {
    updateActiveProjectData({ description });
  }, [updateActiveProjectData]);

  return {
    projects,
    activeProjectId,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
    getActiveProjectData,
    updateActiveProjectData,
    updateActiveTasks,
    updateActiveRoadmap,
    updateActiveFiles,
    updateActiveTechnologies,
    updateActiveDescription,
  };
}
