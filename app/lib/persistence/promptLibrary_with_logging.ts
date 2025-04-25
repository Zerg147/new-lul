import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('PromptLibrary');

export interface PromptItem {
  id: string;
  content: string;
  description: string;
  source: 'input' | 'chat';
  timestamp: string;
  positiveVotes: number;
  negativeVotes: number;
}

// Sample prompts for testing
const samplePrompts: Omit<PromptItem, 'id'>[] = [
  {
    content: 'Create a React component that implements a dark mode toggle',
    description: 'Dark Mode Toggle Component',
    source: 'input',
    timestamp: new Date().toISOString(),
    positiveVotes: 15,
    negativeVotes: 2
  },
  {
    content: 'Write a function to deep clone a JavaScript object without using JSON methods',
    description: 'Deep Clone Function',
    source: 'chat',
    timestamp: new Date().toISOString(),
    positiveVotes: 25,
    negativeVotes: 3
  },
  {
    content: 'Implement a debounce utility function for React',
    description: 'Debounce Utility',
    source: 'input',
    timestamp: new Date().toISOString(),
    positiveVotes: 10,
    negativeVotes: 1
  }
];

// Ensure prompts store exists in database
export function setupPromptStore(db: IDBDatabase) {
  console.log('Checking if prompts store needs to be created...');
  if (!db.objectStoreNames.contains('prompts')) {
    console.log('Creating prompts store...');
    const store = db.createObjectStore('prompts', { keyPath: 'id' });
    store.createIndex('id', 'id', { unique: true });
    console.log('Prompts store created successfully with keyPath: id.');
    
    // Add sample prompts
    addSamplePrompts(db).catch(error => {
      console.error('Failed to add sample prompts:', error);
    });
  } else {
    console.log('Prompts store already exists, no action taken.');
  }
  console.log('Exiting setupPromptStore function.');
}

// Add sample prompts to the database
async function addSamplePrompts(db: IDBDatabase): Promise<void> {
  const transaction = db.transaction('prompts', 'readwrite');
  const store = transaction.objectStore('prompts');

  for (const prompt of samplePrompts) {
    const id = crypto.randomUUID();
    await store.add({ ...prompt, id });
  }
}

// Get all saved prompts
export async function getAllPrompts(db: IDBDatabase): Promise<PromptItem[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('prompts', 'readonly');
    const store = transaction.objectStore('prompts');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as PromptItem[]);
    request.onerror = () => reject(request.error);
  });
}

// Save a new prompt
export async function savePrompt(
  db: IDBDatabase,
  content: string,
  description: string,
  source: 'input' | 'chat'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('prompts', 'readwrite');
    const store = transaction.objectStore('prompts');
    
    const id = crypto.randomUUID();
    const prompt: PromptItem = {
      id,
      content,
      description,
      source,
      timestamp: new Date().toISOString(),
      positiveVotes: 0,
      negativeVotes: 0,
    };

    const request = store.add(prompt);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Delete a prompt
export async function deletePrompt(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('prompts', 'readwrite');
    const store = transaction.objectStore('prompts');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Upvote a prompt
export async function upvotePrompt(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('prompts', 'readwrite');
    const store = transaction.objectStore('prompts');
    
    // First get the prompt
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const prompt = getRequest.result as PromptItem;
      if (!prompt) {
        reject(new Error('Prompt not found'));
        return;
      }

      // Update the positive votes
      prompt.positiveVotes += 1;
      
      // Save the updated prompt
      const updateRequest = store.put(prompt);
      
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Downvote a prompt
export async function downvotePrompt(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('prompts', 'readwrite');
    const store = transaction.objectStore('prompts');
    
    // First get the prompt
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const prompt = getRequest.result as PromptItem;
      if (!prompt) {
        reject(new Error('Prompt not found'));
        return;
      }

      // Update the negative votes
      prompt.negativeVotes += 1;
      
      // Save the updated prompt
      const updateRequest = store.put(prompt);
      
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}
