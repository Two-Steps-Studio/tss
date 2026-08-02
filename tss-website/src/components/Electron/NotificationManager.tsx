'use client';

import { useEffect } from 'react';
import { useNotification } from '@/hooks/useElectron';
import { useIsElectron } from '@/hooks/useElectron';

interface NotificationEvent {
  type: 'message' | 'project' | 'update' | 'invitation' | 'announcement';
  title: string;
  body: string;
  icon?: string;
}

export function NotificationManager() {
  const { showNotification } = useNotification();
  const isElectron = useIsElectron();

  useEffect(() => {
    if (!isElectron) return;

    // Listen for custom notification events from the app
    const handleNotification = (event: CustomEvent<NotificationEvent>) => {
      const { title, body, icon } = event.detail;
      showNotification(title, body, icon);
    };

    window.addEventListener('tss-notification', handleNotification as EventListener);

    return () => {
      window.removeEventListener('tss-notification', handleNotification as EventListener);
    };
  }, [isElectron, showNotification]);

  return null;
}

// Helper function to trigger notifications from anywhere in the app
export function triggerNotification(event: NotificationEvent) {
  const customEvent = new CustomEvent('tss-notification', { detail: event });
  window.dispatchEvent(customEvent);
}

// Pre-defined notification types
export const notifications = {
  newMessage: (senderName: string, messagePreview: string) => ({
    type: 'message' as const,
    title: `Nowa wiadomość od ${senderName}`,
    body: messagePreview,
  }),
  newProject: (projectName: string) => ({
    type: 'project' as const,
    title: 'Nowy projekt',
    body: `Utworzono nowy projekt: ${projectName}`,
  }),
  projectUpdate: (projectName: string, updateType: string) => ({
    type: 'project' as const,
    title: `Aktualizacja projektu: ${projectName}`,
    body: updateType,
  }),
  newInvitation: (inviterName: string, projectName: string) => ({
    type: 'invitation' as const,
    title: 'Nowe zaproszenie',
    body: `${inviterName} zaprosił Cię do projektu: ${projectName}`,
  }),
  newAnnouncement: (title: string, preview: string) => ({
    type: 'announcement' as const,
    title: `Ogłoszenie: ${title}`,
    body: preview,
  }),
  updateAvailable: (version: string) => ({
    type: 'update' as const,
    title: 'Dostępna aktualizacja',
    body: `Nowa wersja ${version} jest gotowa do pobrania`,
  }),
};
