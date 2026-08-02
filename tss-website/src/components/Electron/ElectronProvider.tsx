'use client';

import { useEffect } from 'react';
import { useIsElectron } from '@/hooks/useElectron';
import { OfflineBanner } from './OfflineBanner';
import { UpdateNotification } from './UpdateNotification';
import { NotificationManager } from './NotificationManager';
import { useSession } from '@/hooks/useElectron';
import { useNetworkStatus } from '@/hooks/useElectron';

/**
 * Provider component that integrates all Electron-specific features
 * Should be included in the main app layout
 */
export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const isElectron = useIsElectron();
  const { session, saveSession, isLoading: sessionLoading } = useSession();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    // Only run Electron-specific logic when actually in Electron
    if (!isElectron) return;

    // Restore user session from Electron storage
    if (!sessionLoading && session) {
      // Here you would integrate with your auth system
      // For example, restore the session in your auth context
      console.log('Restoring session from Electron storage:', session);
      
      // Example: Dispatch to your auth context
      // authContext.restoreSession(session);
    }

    // Handle online/offline status changes
    if (isOnline) {
      console.log('App is online - syncing data');
      // Trigger sync with server
    } else {
      console.log('App is offline - using local data');
      // Switch to offline mode
    }
  }, [isElectron, session, sessionLoading, isOnline]);

  if (!isElectron) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Offline status banner */}
      <OfflineBanner />
      
      {/* Auto-update notification */}
      <UpdateNotification />
      
      {/* System notification manager */}
      <NotificationManager />
      
      {/* Main app content */}
      {children}
    </>
  );
}
