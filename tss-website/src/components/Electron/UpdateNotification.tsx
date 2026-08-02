'use client';

import { useAutoUpdater } from '@/hooks/useElectron';
import { Download, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function UpdateNotification() {
  const {
    updateAvailable,
    updateInfo,
    downloadProgress,
    isDownloading,
    isUpdateDownloaded,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  } = useAutoUpdater();

  if (!updateAvailable && !isUpdateDownloaded && !error) return null;

  return (
    <Dialog open={updateAvailable || isUpdateDownloaded || !!error}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpdateDownloaded ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isUpdateDownloaded ? 'Aktualizacja gotowa' : 'Dostępna aktualizacja'}
          </DialogTitle>
          <DialogDescription>
            {isUpdateDownloaded
              ? 'Nowa wersja została pobrana i zostanie zainstalowana po ponownym uruchomieniu aplikacji.'
              : `Dostępna jest nowa wersja Two Steps Studio (${updateInfo?.version || 'unknown'}).`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
            Wystąpił błąd: {error}
          </div>
        )}

        {isDownloading && downloadProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Pobieranie...</span>
              <span>{Math.round(downloadProgress.percent)}%</span>
            </div>
            <Progress value={downloadProgress.percent} />
          </div>
        )}

        {updateInfo?.releaseNotes && !isUpdateDownloaded && (
          <div className="bg-gray-50 rounded-md p-3 text-sm max-h-32 overflow-y-auto">
            <strong>Informacje o wydaniu:</strong>
            <p className="mt-1 text-gray-700">{updateInfo.releaseNotes}</p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isDownloading && !isUpdateDownloaded && (
            <>
              <Button
                variant="outline"
                onClick={() => {/* Close dialog */}}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Później
              </Button>
              <Button
                onClick={downloadUpdate}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Pobierz aktualizację
              </Button>
            </>
          )}

          {isUpdateDownloaded && (
            <>
              <Button
                variant="outline"
                onClick={() => {/* Close dialog */}}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Później
              </Button>
              <Button
                onClick={installUpdate}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Uruchom ponownie i zainstaluj
              </Button>
            </>
          )}

          {error && (
            <Button
              onClick={checkForUpdates}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Spróbuj ponownie
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
