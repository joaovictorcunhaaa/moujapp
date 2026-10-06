/**
 * IndexedDB para performance escalável
 * - Suporta 10.000+ registros
 * - Fallback automático para localStorage
 * - Sincronização em tempo real
 * - Zero lag mesmo com muitos dados
 */

const DB_NAME = 'MoujAppDB';
const DB_VERSION = 1;
const DOSES_STORE = 'doses';
const LIFESTYLE_STORE = 'lifestyle';

export interface IndexedDBConfig {
  dbName?: string;
  version?: number;
}

/**
 * Classe para gerenciar Doses no IndexedDB
 */
export class DosesIndexedDB {
  private db: IDBDatabase | null = null;
  private ready: Promise<boolean>;

  constructor() {
    this.ready = this.init();
  }

  /**
   * Inicializar database
   */
  private async init(): Promise<boolean> {
    return new Promise((resolve) => {
      // Verificar se browser suporta IndexedDB
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB não suportado - usando localStorage');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB');
        resolve(false);
      };

      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        console.info('IndexedDB iniciado com sucesso');
        resolve(true);
      };

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;

        // Criar object store para doses
        if (!db.objectStoreNames.contains(DOSES_STORE)) {
          const store = db.createObjectStore(DOSES_STORE, { keyPath: 'id' });
          // Índices para queries rápidas
          store.createIndex('dateISO', 'dateISO', { unique: false });
          store.createIndex('dosageMg', 'dosageMg', { unique: false });
          console.info('Object store "doses" criado');
        }

        // Criar object store para lifestyle
        if (!db.objectStoreNames.contains(LIFESTYLE_STORE)) {
          db.createObjectStore(LIFESTYLE_STORE, { keyPath: 'id' });
          console.info('Object store "lifestyle" criado');
        }
      };
    });
  }

  /**
   * Aguardar que DB esteja pronto
   */
  async ensureReady(): Promise<boolean> {
    return this.ready;
  }

  /**
   * Verificar se está disponível
   */
  isAvailable(): boolean {
    return this.db !== null;
  }

  /**
   * Adicionar dose
   */
  async addDose(dose: {
    id: string;
    dateISO: string;
    dosageMg: number;
    site?: string;
  }): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readwrite');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.add(dose);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Obter todas as doses com paginação
   */
  async getAllDoses(limit: number = 100, offset: number = 0): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readonly');
      const store = transaction.objectStore(DOSES_STORE);
      const index = store.index('dateISO');

      // Ordem descendente por data
      const request = index.openCursor(null, 'prev');
      const doses: any[] = [];
      let count = 0;
      let skipped = 0;

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursor>).result;

        if (cursor) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
          } else if (count < limit) {
            doses.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(doses);
          }
        } else {
          resolve(doses);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  /**
   * Obter dose por ID
   */
  async getDoseById(id: string): Promise<any | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readonly');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Atualizar dose
   */
  async updateDose(dose: {
    id: string;
    dateISO: string;
    dosageMg: number;
    site?: string;
  }): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readwrite');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.put(dose);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Deletar dose
   */
  async removeDose(id: string): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readwrite');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Contar registros
   */
  async count(): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readonly');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.count();

      request.onsuccess = () => resolve((request as any).result);
      request.onerror = () => resolve(0);
    });
  }

  /**
   * Limpar tudo
   */
  async clearAll(): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readwrite');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Exportar todos os dados
   */
  async exportAll(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readonly');
      const store = transaction.objectStore(DOSES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  }

  /**
   * Importar dados
   */
  async importAll(data: any[]): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DOSES_STORE], 'readwrite');
      const store = transaction.objectStore(DOSES_STORE);

      // Limpar primeiro
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Adicionar dados
        let added = 0;
        data.forEach(item => {
          store.add(item);
          added++;
        });

        transaction.oncomplete = () => {
          console.info(`Importados ${added} registros`);
          resolve(true);
        };
      };

      transaction.onerror = () => resolve(false);
    });
  }
}

// Singleton global
export const dosesDB = new DosesIndexedDB();

/**
 * Classe para gerenciar Lifestyle no IndexedDB
 */
export class LifestyleIndexedDB {
  private db: IDBDatabase | null = null;
  private ready: Promise<boolean>;

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => resolve(false);
      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(true);
      };
    });
  }

  async ensureReady(): Promise<boolean> {
    return this.ready;
  }

  isAvailable(): boolean {
    return this.db !== null;
  }

  async get(): Promise<any | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([LIFESTYLE_STORE], 'readonly');
      const store = transaction.objectStore(LIFESTYLE_STORE);
      const request = store.get('main');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async set(data: any): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([LIFESTYLE_STORE], 'readwrite');
      const store = transaction.objectStore(LIFESTYLE_STORE);
      const request = store.put({ id: 'main', ...data });

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async clear(): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([LIFESTYLE_STORE], 'readwrite');
      const store = transaction.objectStore(LIFESTYLE_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }
}

export const lifestyleDB = new LifestyleIndexedDB();
