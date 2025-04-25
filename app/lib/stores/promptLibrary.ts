import { atom } from 'nanostores';
import { toast } from 'react-toastify';

export interface PromptItem {
  id: string;
  content: string;
  description: string;
  source: 'input' | 'chat';
  timestamp: string;
  positiveVotes: number;
  negativeVotes: number;
}

export type SortOption = 'date' | 'votes';

export interface PromptLibraryState {
  prompts: PromptItem[];
  isLoading: boolean;
  showDialog: boolean;
  sortBy: SortOption;
}

// Sample prompts data
const samplePrompts: PromptItem[] = [
  {
    id: '1',
    content: 'Create a React component that implements a dark mode toggle',
    description: 'Dark Mode Toggle Component',
    source: 'input',
    timestamp: '2024-01-15T10:30:00Z',
    positiveVotes: 15,
    negativeVotes: 2
  },
  {
    id: '2',
    content: 'Write a function to deep clone a JavaScript object without using JSON methods',
    description: 'Deep Clone Function',
    source: 'chat',
    timestamp: '2024-01-14T15:45:00Z',
    positiveVotes: 25,
    negativeVotes: 3
  },
  {
    id: '3',
    content: 'Implement a debounce utility function for React',
    description: 'Debounce Utility',
    source: 'input',
    timestamp: '2024-01-13T09:20:00Z',
    positiveVotes: 10,
    negativeVotes: 1
  },
  {
    id: '4',
    content: 'Create a custom React hook for handling form validation',
    description: 'Form Validation Hook',
    source: 'chat',
    timestamp: '2024-01-16T14:15:00Z',
    positiveVotes: 30,
    negativeVotes: 4
  },
  {
    id: '5',
    content: 'Implement a responsive navigation menu with React and Tailwind CSS',
    description: 'Responsive Navigation',
    source: 'input',
    timestamp: '2024-01-12T11:45:00Z',
    positiveVotes: 20,
    negativeVotes: 2
  }
];

const initialState: PromptLibraryState = {
  prompts: samplePrompts,
  isLoading: false,
  showDialog: false,
  sortBy: 'date'
};

export const promptLibraryStore = atom<PromptLibraryState>(initialState);

// Sort prompts based on the current sort option
function sortPrompts(prompts: PromptItem[], sortBy: SortOption): PromptItem[] {
  return [...prompts].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      // Sort by net votes (positive - negative)
      const netVotesA = a.positiveVotes - a.negativeVotes;
      const netVotesB = b.positiveVotes - b.negativeVotes;
      return netVotesB - netVotesA;
    }
  });
}

// Actions
export const promptLibraryActions = {
  toggleDialog: (show: boolean) => {
    promptLibraryStore.set({
      ...promptLibraryStore.get(),
      showDialog: show
    });
  },

  setSortOption: (sortBy: SortOption) => {
    const state = promptLibraryStore.get();
    const sortedPrompts = sortPrompts(state.prompts, sortBy);
    promptLibraryStore.set({
      ...state,
      sortBy,
      prompts: sortedPrompts
    });
  },

  loadPrompts: async () => {
    const state = promptLibraryStore.get();
    promptLibraryStore.set({
      ...state,
      isLoading: true
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const sortedPrompts = sortPrompts(samplePrompts, state.sortBy);
      promptLibraryStore.set({
        ...state,
        prompts: sortedPrompts,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load prompts:', error);
      toast.error('Failed to load prompts');
      promptLibraryStore.set({
        ...state,
        isLoading: false
      });
    }
  },

  savePrompt: async (content: string, description: string, source: 'input' | 'chat') => {
    try {
      const state = promptLibraryStore.get();
      const newPrompt: PromptItem = {
        id: crypto.randomUUID(),
        content,
        description,
        source,
        timestamp: new Date().toISOString(),
        positiveVotes: 0,
        negativeVotes: 0
      };

      const updatedPrompts = [...state.prompts, newPrompt];
      const sortedPrompts = sortPrompts(updatedPrompts, state.sortBy);

      promptLibraryStore.set({
        ...state,
        prompts: sortedPrompts
      });

      toast.success('Prompt saved successfully');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast.error('Failed to save prompt');
    }
  },

  deletePrompt: async (id: string) => {
    try {
      const state = promptLibraryStore.get();
      const updatedPrompts = state.prompts.filter(prompt => prompt.id !== id);
      
      promptLibraryStore.set({
        ...state,
        prompts: updatedPrompts
      });

      toast.success('Prompt deleted successfully');
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      toast.error('Failed to delete prompt');
    }
  },

  upvotePrompt: async (id: string) => {
    try {
      const state = promptLibraryStore.get();
      const updatedPrompts = state.prompts.map(prompt => {
        if (prompt.id === id) {
          return {
            ...prompt,
            positiveVotes: prompt.positiveVotes + 1
          };
        }
        return prompt;
      });

      const sortedPrompts = sortPrompts(updatedPrompts, state.sortBy);
      
      promptLibraryStore.set({
        ...state,
        prompts: sortedPrompts
      });

      toast.success('Prompt upvoted successfully');
    } catch (error) {
      console.error('Failed to upvote prompt:', error);
      toast.error('Failed to upvote prompt');
    }
  },

  downvotePrompt: async (id: string) => {
    try {
      const state = promptLibraryStore.get();
      const updatedPrompts = state.prompts.map(prompt => {
        if (prompt.id === id) {
          return {
            ...prompt,
            negativeVotes: prompt.negativeVotes + 1
          };
        }
        return prompt;
      });

      const sortedPrompts = sortPrompts(updatedPrompts, state.sortBy);
      
      promptLibraryStore.set({
        ...state,
        prompts: sortedPrompts
      });

      toast.success('Prompt downvoted successfully');
    } catch (error) {
      console.error('Failed to downvote prompt:', error);
      toast.error('Failed to downvote prompt');
    }
  }
};
