import { atom } from 'nanostores';
import type { PromptItem } from '../persistence/promptLibrary_with_logging';
import { getAllPrompts, savePrompt, deletePrompt } from '../persistence/promptLibrary_with_logging';
import { openDatabase } from '../persistence/db_with_logging';
import { toast } from 'react-toastify';

export interface PromptLibraryState {
  prompts: PromptItem[];
  isLoading: boolean;
  showDialog: boolean;
}

const initialState: PromptLibraryState = {
  prompts: [],
  isLoading: false,
  showDialog: false
};

export const promptLibraryStore = atom<PromptLibraryState>(initialState);

// Actions
export const promptLibraryActions = {
  toggleDialog: (show: boolean) => {
    promptLibraryStore.set({
      ...promptLibraryStore.get(),
      showDialog: show
    });
  },

  loadPrompts: async () => {
    promptLibraryStore.set({
      ...promptLibraryStore.get(),
      isLoading: true
    });

    try {
      const db = await openDatabase();
      if (!db) {
        throw new Error('Failed to open database');
      }

      const prompts = await getAllPrompts(db);
      promptLibraryStore.set({
        ...promptLibraryStore.get(),
        prompts,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load prompts:', error);
      toast.error('Failed to load prompts');
      promptLibraryStore.set({
        ...promptLibraryStore.get(),
        isLoading: false
      });
    }
  },

  savePrompt: async (content: string, description: string, source: 'input' | 'chat') => {
    try {
      const db = await openDatabase();
      if (!db) {
        throw new Error('Failed to open database');
      }

      await savePrompt(db, content, description, source);
      await promptLibraryActions.loadPrompts(); // Reload prompts after saving
      toast.success('Prompt saved successfully');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast.error('Failed to save prompt');
    }
  },

  deletePrompt: async (id: string) => {
    try {
      const db = await openDatabase();
      if (!db) {
        throw new Error('Failed to open database');
      }

      await deletePrompt(db, id);
      await promptLibraryActions.loadPrompts(); // Reload prompts after deleting
      toast.success('Prompt deleted successfully');
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      toast.error('Failed to delete prompt');
    }
  }
};
