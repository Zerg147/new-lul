import React from 'react';
import { useStore } from '@nanostores/react';
import { promptLibraryStore, promptLibraryActions, type SortOption } from '~/lib/stores/promptLibrary';
import { IconButton } from '../ui/IconButton';
import { PromptVoting } from './PromptVoting';

export function PromptList() {
  const { prompts, isLoading, sortBy } = useStore(promptLibraryStore);

  const handleDelete = async (id: string) => {
    await promptLibraryActions.deletePrompt(id);
  };

  const handleSortChange = (newSortOption: SortOption) => {
    promptLibraryActions.setSortOption(newSortOption);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-4 pb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 text-sm ${
              sortBy === 'date'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            } rounded-l-lg transition-colors`}
            onClick={() => handleSortChange('date')}
          >
            Date
          </button>
          <button
            className={`px-4 py-2 text-sm ${
              sortBy === 'votes'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            } rounded-r-lg transition-colors`}
            onClick={() => handleSortChange('votes')}
          >
            Votes
          </button>
        </div>
      </div>

      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{prompt.description}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {prompt.content}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Source: {prompt.source}</span>
                <span>•</span>
                <span>{new Date(prompt.timestamp).toLocaleString()}</span>
                <span>•</span>
                <span>Net votes: {prompt.positiveVotes - prompt.negativeVotes}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PromptVoting prompt={prompt} />
              <IconButton
                onClick={() => handleDelete(prompt.id)}
                title="Delete"
                className="text-red-500 hover:text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        </div>
      ))}
      {prompts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No prompts saved yet.
        </div>
      )}
    </div>
  );
}
