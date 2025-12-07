/**
 * Offline Mode Service
 * Handles IndexedDB operations for offline storage
 */

const DB_NAME = 'PathshalaCoachDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  QUESTIONS: 'questions',
  QUIZ_ATTEMPTS: 'quizAttempts',
  FLASHCARDS: 'flashcards',
  PDFS: 'pdfs',
  SETTINGS: 'settings',
} as const;

let db: IDBDatabase | null = null;

export interface OfflineQuestion {
  id: string;
  examType: string;
  data: any;
}

export interface OfflineQuizAttempt {
  id: string;
  userId: string;
  data: any;
  synced: boolean;
  timestamp: number;
}

export interface OfflineFlashcard {
  id: string;
  userId: string;
  data: any;
}

export interface OfflinePDF {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  size: number;
  downloadedAt: number;
}

/**
 * Initialize IndexedDB
 */
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Questions store
      if (!database.objectStoreNames.contains(STORES.QUESTIONS)) {
        const questionStore = database.createObjectStore(STORES.QUESTIONS, {
          keyPath: 'id',
        });
        questionStore.createIndex('examType', 'examType', { unique: false });
      }

      // Quiz attempts store (for offline sync)
      if (!database.objectStoreNames.contains(STORES.QUIZ_ATTEMPTS)) {
        const attemptStore = database.createObjectStore(STORES.QUIZ_ATTEMPTS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        attemptStore.createIndex('userId', 'userId', { unique: false });
        attemptStore.createIndex('synced', 'synced', { unique: false });
        attemptStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Flashcards store
      if (!database.objectStoreNames.contains(STORES.FLASHCARDS)) {
        const flashcardStore = database.createObjectStore(STORES.FLASHCARDS, {
          keyPath: 'id',
        });
        flashcardStore.createIndex('userId', 'userId', { unique: false });
      }

      // PDFs store
      if (!database.objectStoreNames.contains(STORES.PDFS)) {
        const pdfStore = database.createObjectStore(STORES.PDFS, {
          keyPath: 'id',
        });
        pdfStore.createIndex('name', 'name', { unique: false });
        pdfStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }

      // Settings store
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, {
          keyPath: 'key',
        });
      }
    };
  });
}

/**
 * Save questions for offline use
 */
export async function saveQuestionsOffline(
  questions: OfflineQuestion[]
): Promise<void> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.QUESTIONS], 'readwrite');
  const store = transaction.objectStore(STORES.QUESTIONS);

  await Promise.all(
    questions.map((question) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(question);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    })
  );
}

/**
 * Get offline questions
 */
export async function getOfflineQuestions(
  examType: string
): Promise<OfflineQuestion[]> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.QUESTIONS], 'readonly');
  const store = transaction.objectStore(STORES.QUESTIONS);
  const index = store.index('examType');

  return new Promise((resolve, reject) => {
    const request = index.getAll(examType);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save quiz attempt for offline sync
 */
export async function saveQuizAttemptOffline(
  attempt: OfflineQuizAttempt
): Promise<void> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.QUIZ_ATTEMPTS], 'readwrite');
  const store = transaction.objectStore(STORES.QUIZ_ATTEMPTS);

  return new Promise((resolve, reject) => {
    const request = store.add(attempt);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get pending quiz attempts to sync
 */
export async function getPendingQuizAttempts(): Promise<OfflineQuizAttempt[]> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.QUIZ_ATTEMPTS], 'readonly');
  const store = transaction.objectStore(STORES.QUIZ_ATTEMPTS);
  const index = store.index('synced');

  return new Promise((resolve, reject) => {
    const request = index.getAll(false);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mark quiz attempt as synced
 */
export async function markQuizAttemptSynced(id: number): Promise<void> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.QUIZ_ATTEMPTS], 'readwrite');
  const store = transaction.objectStore(STORES.QUIZ_ATTEMPTS);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const attempt = getRequest.result;
      if (attempt) {
        attempt.synced = true;
        const putRequest = store.put(attempt);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Download and save PDF for offline use
 */
export async function downloadPDFForOffline(
  id: string,
  name: string,
  url: string
): Promise<void> {
  try {
    // Fetch PDF
    const response = await fetch(url);
    const blob = await response.blob();

    const pdfData: OfflinePDF = {
      id,
      name,
      url,
      blob,
      size: blob.size,
      downloadedAt: Date.now(),
    };

    const database = await initOfflineDB();
    const transaction = database.transaction([STORES.PDFS], 'readwrite');
    const store = transaction.objectStore(STORES.PDFS);

    return new Promise((resolve, reject) => {
      const request = store.put(pdfData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Get offline PDFs
 */
export async function getOfflinePDFs(): Promise<OfflinePDF[]> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.PDFS], 'readonly');
  const store = transaction.objectStore(STORES.PDFS);
  const index = store.index('downloadedAt');

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => {
      const pdfs = request.result || [];
      // Sort by downloadedAt descending
      pdfs.sort((a, b) => b.downloadedAt - a.downloadedAt);
      resolve(pdfs);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get offline PDF by ID
 */
export async function getOfflinePDF(id: string): Promise<OfflinePDF | null> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.PDFS], 'readonly');
  const store = transaction.objectStore(STORES.PDFS);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete offline PDF
 */
export async function deleteOfflinePDF(id: string): Promise<void> {
  const database = await initOfflineDB();
  const transaction = database.transaction([STORES.PDFS], 'readwrite');
  const store = transaction.objectStore(STORES.PDFS);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get stored space used
 */
export async function getStorageUsage(): Promise<{
  total: number;
  pdfs: number;
  questions: number;
}> {
  const database = await initOfflineDB();
  let total = 0;
  let pdfsSize = 0;
  let questionsSize = 0;

  // Calculate PDFs size
  const pdfs = await getOfflinePDFs();
  pdfsSize = pdfs.reduce((sum, pdf) => sum + pdf.size, 0);

  // Estimate questions size (rough calculation)
  const transaction = database.transaction([STORES.QUESTIONS], 'readonly');
  const store = transaction.objectStore(STORES.QUESTIONS);
  const questions = await new Promise<OfflineQuestion[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  questionsSize = JSON.stringify(questions).length;

  total = pdfsSize + questionsSize;

  return { total, pdfs: pdfsSize, questions: questionsSize };
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  const database = await initOfflineDB();
  const stores = Object.values(STORES);

  await Promise.all(
    stores.map((storeName) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = database!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    })
  );
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

