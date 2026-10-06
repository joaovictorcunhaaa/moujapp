/**
 * Hook que usa IndexedDB com fallback automático
 * - Usa IndexedDB se disponível (melhor performance)
 * - Fallback para localStorage se IndexedDB não funcionar
 * - Sincroniza automaticamente entre os dois
 * - Transparente para componentes
 */

import { useEffect, useState, useCallback } from 'react';
import { dosesDB } from '@/utils/indexeddb';
import { useDoses as useLocalStorageDoses } from './useDoses';

export interface DoseRecord {
  id: string;
  dateISO: string;
  dosageMg: number;
  site?: string;
}

interface UseIndexedDBDosesResult {
  doses: DoseRecord[];
  addDose: (date: Date, dosageMg: number, site?: string) => Promise<void>;
  removeDose: (id: string) => Promise<void>;
  lastDose: DoseRecord | null;
  usingIndexedDB: boolean;
  count: number;
  error: string | null;
}

/**
 * Hook que automaticamente usa IndexedDB ou fallback para localStorage
 */
export const useIndexedDBDoses = (): UseIndexedDBDosesResult => {
  const [doses, setDoses] = useState<DoseRecord[]>([]);
  const [usingIndexedDB, setUsingIndexedDB] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fallback para localStorage
  const localStorageDoses = useLocalStorageDoses();

  // Inicializar: carregar dados
  useEffect(() => {
    const init = async () => {
      try {
        // Tentar usar IndexedDB
        const isReady = await dosesDB.ensureReady();

        if (isReady && dosesDB.isAvailable()) {
          // IndexedDB disponível
          setUsingIndexedDB(true);
          const dosesData = await dosesDB.getAllDoses(1000); // Carregar primeiros 1000

          if (dosesData.length === 0 && localStorageDoses.doses.length > 0) {
            // Se IndexedDB vazio mas localStorage tem dados, migrar
            console.info('Migrando dados de localStorage para IndexedDB...');
            await dosesDB.importAll(localStorageDoses.doses);
            setDoses(localStorageDoses.doses);
          } else {
            setDoses(dosesData);
          }

          const totalCount = await dosesDB.count();
          setCount(totalCount);
        } else {
          // Fallback para localStorage
          console.warn('IndexedDB não disponível, usando localStorage');
          setUsingIndexedDB(false);
          setDoses(localStorageDoses.doses);
          setCount(localStorageDoses.doses.length);
        }
      } catch (err) {
        console.error('Erro ao inicializar doses:', err);
        setError('Erro ao carregar doses');
        // Fallback para localStorage
        setUsingIndexedDB(false);
        setDoses(localStorageDoses.doses);
      }
    };

    init();
  }, []);

  // Adicionar dose
  const addDose = useCallback(
    async (date: Date, dosageMg: number, site?: string) => {
      try {
        const record: DoseRecord = {
          id: `${date.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
          dateISO: date.toISOString(),
          dosageMg,
          site,
        };

        if (usingIndexedDB && dosesDB.isAvailable()) {
          // Usar IndexedDB
          const success = await dosesDB.addDose(record);
          if (success) {
            // Atualizar state localmente
            const updated = [record, ...doses].sort(
              (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
            );
            setDoses(updated);

            // Atualizar count
            const newCount = await dosesDB.count();
            setCount(newCount);

            // Sincronizar com localStorage (backup)
            localStorageDoses.addDose(date, dosageMg, site);
            setError(null);
          } else {
            throw new Error('Erro ao adicionar dose no IndexedDB');
          }
        } else {
          // Fallback para localStorage
          localStorageDoses.addDose(date, dosageMg, site);
          setDoses(localStorageDoses.doses);
          setCount(localStorageDoses.doses.length);
        }
      } catch (err) {
        console.error('Erro ao adicionar dose:', err);
        setError('Erro ao adicionar dose');
        // Ainda assim tentar localStorage como último recurso
        localStorageDoses.addDose(date, dosageMg, site);
      }
    },
    [doses, usingIndexedDB, localStorageDoses]
  );

  // Remover dose
  const removeDose = useCallback(
    async (id: string) => {
      try {
        if (usingIndexedDB && dosesDB.isAvailable()) {
          // Usar IndexedDB
          const success = await dosesDB.removeDose(id);
          if (success) {
            // Atualizar state localmente
            const updated = doses.filter(d => d.id !== id);
            setDoses(updated);

            // Atualizar count
            const newCount = await dosesDB.count();
            setCount(newCount);

            // Sincronizar com localStorage (backup)
            localStorageDoses.removeDose(id);
            setError(null);
          } else {
            throw new Error('Erro ao remover dose no IndexedDB');
          }
        } else {
          // Fallback para localStorage
          localStorageDoses.removeDose(id);
          setDoses(localStorageDoses.doses);
        }
      } catch (err) {
        console.error('Erro ao remover dose:', err);
        setError('Erro ao remover dose');
      }
    },
    [doses, usingIndexedDB, localStorageDoses]
  );

  const lastDose = doses.length > 0 ? doses[0] : null;

  return {
    doses,
    addDose,
    removeDose,
    lastDose,
    usingIndexedDB,
    count,
    error,
  };
};
