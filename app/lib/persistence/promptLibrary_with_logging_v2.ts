import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('PromptLibrary');

export interface PromptItem {
  id: string;
  content: string;
  description: string;
  source: 'input' | 'chat';
  timestamp: string;
}

// Ensure prompts store exists in database
export function setupPromptStore(db: IDBDatabase) {
  console.log('Setting up prompts store...');
  if (!db.objectStoreNames.contains('prompts')) {
    console.log('Creating prompts store...');
    const store = db.createObjectStore('prompts', { keyPath: 'id' });
    store.createIndex('id', 'id', { unique: true });
    console.log('Prompts store created successfully.');
  } else {
    console.log('Prompts store already exists.');
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
      timestamp: new Date().toISOString()
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
