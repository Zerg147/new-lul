import { useEffect } from 'react';
import { settingsActions } from '../stores/settings';
import { workbenchStore } from '../stores/workbench';

// Simple event emitter implementation for browser
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }
}

// Create a singleton instance
export const shortcutEventEmitter = new SimpleEventEmitter();

type ShortcutHandler = (e: KeyboardEvent) => void;
type ShortcutConfig = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  preventDefault?: boolean;
  description?: string;
  emit?: string; // Event name to emit for backward compatibility
};

// Base shortcuts that are always active
const baseShortcuts: ShortcutConfig[] = [
  {
    key: '`',
    metaKey: true,
    handler: () => {
      workbenchStore.toggleTerminal();
    },
    preventDefault: true,
    description: 'Toggle Terminal',
    emit: 'toggleTerminal'
  }
];

// Settings-specific shortcuts
const settingsShortcuts: ShortcutConfig[] = [
  {
    key: ',',
    metaKey: true,
    handler: () => settingsActions.togglePanel(),
    preventDefault: true,
    description: 'Toggle Settings Panel',
  },
  {
    key: 't',
    metaKey: true,
    handler: () => settingsActions.toggleTheme(),
    preventDefault: true,
    description: 'Toggle Dark Mode',
  },
  {
    key: 'Escape',
    handler: () => settingsActions.closePanel(),
    preventDefault: true,
    description: 'Close Current Panel',
  }
];

// Combined shortcuts for the settings panel
export const defaultShortcuts = [...baseShortcuts, ...settingsShortcuts];

// Main hook that can be used with or without parameters
export function useShortcuts(shortcuts?: ShortcutConfig[]) {
  useEffect(() => {
    const shortcutsToUse = shortcuts || baseShortcuts;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcutsToUse) {
        const isCtrlPressed = shortcut.ctrlKey ? e.ctrlKey : true;
        const isMetaPressed = shortcut.metaKey ? e.metaKey : true;
        
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          isCtrlPressed &&
          isMetaPressed
        ) {
          if (shortcut.preventDefault) {
            e.preventDefault();
          }
          
          // Emit event for backward compatibility
          if (shortcut.emit) {
            shortcutEventEmitter.emit(shortcut.emit);
          }
          
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Hook for using default shortcuts (including settings shortcuts)
export function useDefaultShortcuts() {
  useShortcuts(defaultShortcuts);
}

// Helper function to format shortcut for display
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  
  if (shortcut.metaKey) {
    parts.push('⌘');
  }
  if (shortcut.ctrlKey) {
    parts.push('Ctrl');
  }
  
  // Format special keys
  const keyMap: Record<string, string> = {
    ',': ',',
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': '↵',
    '`': '`',
  };

  parts.push(keyMap[shortcut.key] || shortcut.key.toUpperCase());

  return parts.join(' + ');
}

// Get all registered shortcuts
export function getRegisteredShortcuts(): Array<{
  key: string;
  description: string;
  shortcut: string;
}> {
  return defaultShortcuts
    .filter(s => s.description) // Only include shortcuts with descriptions
    .map(shortcut => ({
      key: shortcut.key,
      description: shortcut.description!,
      shortcut: formatShortcut(shortcut),
    }));
}
