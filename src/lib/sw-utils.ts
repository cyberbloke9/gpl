/**
 * Service Worker and Cache Management Utilities
 * Used to force clear old cached versions and ensure fresh content
 */

export const clearServiceWorkerCache = async (): Promise<void> => {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
  } catch (error) {
    console.error('Error clearing service worker cache:', error);
  }
};

export const APP_VERSION = "2.1.0";

export const checkAppVersion = (): boolean => {
  const storedVersion = localStorage.getItem('app_version');
  if (storedVersion !== APP_VERSION) {
    localStorage.setItem('app_version', APP_VERSION);
    return false; // Old version detected
  }
  return true; // Current version
};
