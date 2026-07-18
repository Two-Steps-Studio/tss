/**
 * Storage utilities for localStorage operations
 */

/**
 * Saves a value to localStorage with error handling
 */
const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }
};

/**
 * Notification storage keys
 */
const NOTIF_KEYS = ['notif-news', 'notif-esport', 'notif-dev'] as const;
const UI_KEYS = ['ui-animations', 'ui-sounds', 'ui-quality'] as const;

// Nowy klucz do filtrowania widoku sidebara (domyślnie true = pokazuj wszystkie kategorie)
export const setShowAllCategoriesStorage = (value: boolean | undefined) => {
  setLocalStorage('show-all-categories', value ?? true ? 'on' : 'off'); // domyślnie włączone=true
};

/**
 * Saves notification preference to localStorage
 */
export const setNotifStorage = (key: (typeof NOTIF_KEYS)[number], value: boolean) => {
  setLocalStorage(key, value ? 'on' : 'off');
};

/**
 * Saves UI preference to localStorage
 */
export const setUiStorage = (key: (typeof UI_KEYS)[number], value: boolean | 'high' | 'low') => {
  if (key === 'ui-quality') {
    setLocalStorage(key, value === true ? 'high' : 'low');
  } else {
    setLocalStorage(key, value ? 'on' : 'off');
  }
};
