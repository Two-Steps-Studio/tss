/**
 * API wrapper with offline support for Electron
 * Handles automatic reconnection and offline mode
 */

interface RequestOptions extends RequestInit {
  skipOfflineCheck?: boolean;
}

class ElectronAPIWrapper {
  private queue: Array<{ url: string; options: RequestOptions; resolve: (value: any) => void; reject: (reason: any) => void }> = [];
  private isProcessingQueue = false;

  async fetch(url: string, options: RequestOptions = {}): Promise<Response> {
    const { skipOfflineCheck = false, ...fetchOptions } = options;

    // Check network status if not in Electron or not skipping check
    if (typeof window !== 'undefined' && window.electron && !skipOfflineCheck) {
      const isOnline = await window.electron.isOnline();
      
      if (!isOnline) {
        // Queue the request for when we come back online
        return new Promise((resolve, reject) => {
          this.queue.push({ url, options: fetchOptions, resolve, reject });
        });
      }
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      // If it's a network error, queue the request
      if (!skipOfflineCheck && this.isNetworkError(error)) {
        return new Promise((resolve, reject) => {
          this.queue.push({ url, options: fetchOptions, resolve, reject });
        });
      }
      throw error;
    }
  }

  private isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes('fetch');
  }

  async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const { url, options, resolve, reject } = this.queue.shift()!;
      
      try {
        const response = await this.fetch(url, { ...options, skipOfflineCheck: true });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  clearQueue(): void {
    this.queue.forEach(({ reject }) => {
      reject(new Error('Request cancelled due to going offline'));
    });
    this.queue = [];
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

export const electronAPI = new ElectronAPIWrapper();

// Enhanced fetch function with offline support
export async function fetchWithOfflineSupport(url: string, options: RequestOptions = {}): Promise<Response> {
  return electronAPI.fetch(url, options);
}
