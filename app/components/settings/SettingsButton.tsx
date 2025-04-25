import React from 'react';
import { IconButton } from '../ui/IconButton';
import { settingsActions } from '~/lib/stores/settings';
import { useStore } from '@nanostores/react';
import { settingsStore } from '~/lib/stores/settings';

export function SettingsButton() {
  const { theme } = useStore(settingsStore);

  return (
    <IconButton
      onClick={settingsActions.togglePanel}
      className={`fixed right-4 top-4 z-40 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all 
        hover:bg-gray-100 hover:shadow-xl active:transform active:scale-95
        dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-700
        ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
      title="Settings (⌘ ,)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </IconButton>
  );
}
