import React, { useEffect } from 'react';
import { SettingsButton } from './SettingsButton';
import { SettingsPanel } from './SettingsPanel';
import { settingsActions } from '~/lib/stores/settings';
import { useDefaultShortcuts } from '~/lib/hooks/useShortcuts';

interface SettingsProps {
  className?: string;
}

export function Settings({ className }: SettingsProps) {
  // Use default keyboard shortcuts
  useDefaultShortcuts();

  // Initialize theme based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      settingsActions.toggleTheme();
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className={className}>
      <SettingsButton />
      <SettingsPanel />
    </div>
  );
}
