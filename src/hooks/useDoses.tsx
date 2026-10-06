import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/utils/storage';
import { StorageSchemas } from '@/utils/storage';

export interface DoseRecord {
  id: string;
  dateISO: string; // ISO string da data/hora da aplicação
  dosageMg: number; // mg
  site?: string; // opcional: local da aplicação
}

const STORAGE_KEY = 'moujapp-doses';

interface DosesContextValue {
  doses: DoseRecord[];
  addDose: (date: Date, dosageMg: number, site?: string) => void;
  clearDoses: () => void;
  removeDose: (id: string) => void;
  lastDose: DoseRecord | null;
  error: string | null;
}

const DosesContext = createContext<DosesContextValue | null>(null);

export const DosesProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Carregar com validação - nunca quebra
  const [doses, setDoses] = useState<DoseRecord[]>(() => {
    return loadFromStorage(STORAGE_KEY, StorageSchemas.doses, []);
  });

  const [error, setError] = useState<string | null>(null);

  // ✅ Salvar com validação - sempre seguro
  useEffect(() => {
    const success = saveToStorage(STORAGE_KEY, doses, StorageSchemas.doses);
    if (!success) {
      setError('Falha ao salvar histórico de doses');
    } else {
      setError(null);
    }
  }, [doses]);

  const addDose = (date: Date, dosageMg: number, site?: string) => {
    const record: DoseRecord = {
      id: `${date.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
      dateISO: date.toISOString(),
      dosageMg,
      site,
    };

    // ✅ Validar antes de adicionar
    const validation = StorageSchemas.dose.safeParse(record);
    if (!validation.success) {
      setError('Dose inválida - não foi adicionada');
      return;
    }

    setDoses(prev => [record, ...prev].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()));
    setError(null);
  };

  const clearDoses = () => {
    removeFromStorage(STORAGE_KEY);
    setDoses([]);
  };

  const removeDose = (id: string) => {
    setDoses(prev => prev.filter(d => d.id !== id));
  };

  const lastDose = useMemo(() => (doses.length ? doses[0] : null), [doses]);

  const value: DosesContextValue = { doses, addDose, clearDoses, removeDose, lastDose, error };

  return (
    <DosesContext.Provider value={value}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </DosesContext.Provider>
  );
};

export const useDoses = (): DosesContextValue => {
  const ctx = useContext(DosesContext);
  if (!ctx) {
    throw new Error('useDoses deve ser usado dentro de DosesProvider');
  }
  return ctx;
};

export default useDoses;