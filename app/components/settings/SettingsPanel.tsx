import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { settingsStore, settingsActions } from '~/lib/stores/settings';
import { IconButton } from '../ui/IconButton';
import { getRegisteredShortcuts } from '~/lib/hooks/useShortcuts';

export function SettingsPanel() {
  const { isOpen, theme } = useStore(settingsStore);
  const shortcuts = getRegisteredShortcuts();

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        settingsActions.closePanel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-in-out dark:bg-black/40"
        onClick={settingsActions.closePanel}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-80 transform overflow-y-auto bg-white p-6 shadow-xl transition-all duration-300 ease-in-out dark:bg-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-white">Settings</h2>
          <IconButton
            onClick={settingsActions.closePanel}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        <div className="mt-6 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Appearance
            </h3>
            <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium dark:text-white">
                    Dark Mode
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <button
                  onClick={settingsActions.toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="dark:text-white">{shortcut.description}</span>
                  <kbd className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-600 dark:text-gray-200">
                    {shortcut.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Account
            </h3>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <button
                onClick={() => {
                  // Add logout logic here
                  console.log('Logging out...');
                }}
                className="w-full rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600 hover:shadow-md active:transform active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Version 1.0.0
        </div>
      </div>
    </>
  );
}
