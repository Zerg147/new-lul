import type { Message } from 'ai';
import { createScopedLogger } from '~/utils/logger';
import { setupPromptStore } from './promptLibrary';
import type { ChatHistoryItem } from './useChatHistory';

const logger = createScopedLogger('ChatHistory');

// this is used at the top level and never rejects
export async function openDatabase(): Promise<IDBDatabase | undefined> {
  console.log('Opening database...');
  return new Promise((resolve) => {
    const request = indexedDB.open('boltHistory', 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      console.log('Database upgrade needed, setting up stores...');
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
        store.createIndex('urlId', 'urlId', { unique: true });
      }

      setupPromptStore(db);
    };

    request.onsuccess = (event: Event) => {
      console.log('Database opened successfully.');
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      resolve(undefined);
      logger.error((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Other functions remain unchanged...
