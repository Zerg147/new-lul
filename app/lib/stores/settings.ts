import { atom } from 'nanostores';

export interface SettingsState {
  isOpen: boolean;
  theme: 'light' | 'dark';
}

const initialState: SettingsState = {
  isOpen: false,
  theme: 'light'
};

export const settingsStore = atom<SettingsState>(initialState);

// Initialize theme from system preference
if (typeof window !== 'undefined') {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  initialState.theme = isDarkMode ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', isDarkMode);
}

export const settingsActions = {
  togglePanel: () => {
    const state = settingsStore.get();
    settingsStore.set({
      ...state,
      isOpen: !state.isOpen
    });
  },

  toggleTheme: () => {
    const state = settingsStore.get();
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    settingsStore.set({
      ...state,
      theme: newTheme
    });
    // Update the document class for theme
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  },

  closePanel: () => {
    settingsStore.set({
      ...settingsStore.get(),
      isOpen: false
    });
  }
};

// Setup keyboard shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    // Command/Ctrl + , to toggle settings
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      settingsActions.togglePanel();
    }
    
    // Command/Ctrl + T to toggle theme
    if ((e.metaKey || e.ctrlKey) && e.key === 't') {
      e.preventDefault();
      settingsActions.toggleTheme();
    }
  });
}
