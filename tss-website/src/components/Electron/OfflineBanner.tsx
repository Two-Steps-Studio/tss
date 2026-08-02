'use client';

import { useNetworkStatus } from '@/hooks/useElectron';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineBanner() {
  const { isOnline, isChecking, checkNetwork } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">
          Brak połączenia z internetem. Niektóre funkcje mogą być niedostępne.
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={checkNetwork}
        disabled={isChecking}
        className="bg-white text-red-600 hover:bg-gray-100"
      >
        {isChecking ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Sprawdzanie...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sprawdź ponownie
          </>
        )}
      </Button>
    </div>
  );
}
