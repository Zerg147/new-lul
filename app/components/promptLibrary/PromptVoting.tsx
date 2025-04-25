import React from 'react';
import { IconButton } from '../ui/IconButton';
import { promptLibraryActions } from '~/lib/stores/promptLibrary';
import type { PromptItem } from '~/lib/stores/promptLibrary';

interface PromptVotingProps {
  prompt: PromptItem;
}

export function PromptVoting({ prompt }: PromptVotingProps) {
  const handleUpvote = async () => {
    await promptLibraryActions.upvotePrompt(prompt.id);
  };

  const handleDownvote = async () => {
    await promptLibraryActions.downvotePrompt(prompt.id);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <IconButton
          onClick={handleUpvote}
          title="Upvote"
          className="text-green-500 hover:text-green-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </IconButton>
        <span className="mx-1">{prompt.positiveVotes}</span>
      </div>
      <div className="flex items-center">
        <IconButton
          onClick={handleDownvote}
          title="Downvote"
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
              d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </IconButton>
        <span className="mx-1">{prompt.negativeVotes}</span>
      </div>
    </div>
  );
}
