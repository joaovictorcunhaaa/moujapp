import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

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
}

const DosesContext = createContext<DosesContextValue | null>(null);

export const DosesProvider = ({ children }: { children: ReactNode }) => {
  const [doses, setDoses] = useState<DoseRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: DoseRecord[] = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doses));
  }, [doses]);

  const addDose = (date: Date, dosageMg: number, site?: string) => {
    const record: DoseRecord = {
      id: `${date.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
      dateISO: date.toISOString(),
      dosageMg,
      site,
    };
    setDoses(prev => [record, ...prev].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()));
  };

  const clearDoses = () => setDoses([]);
  const removeDose = (id: string) => setDoses(prev => prev.filter(d => d.id !== id));

  const lastDose = useMemo(() => (doses.length ? doses[0] : null), [doses]);

  const value: DosesContextValue = { doses, addDose, clearDoses, removeDose, lastDose };

  return <DosesContext.Provider value={value}>{children}</DosesContext.Provider>;
};

export const useDoses = (): DosesContextValue => {
  const ctx = useContext(DosesContext);
  if (!ctx) {
    throw new Error('useDoses deve ser usado dentro de DosesProvider');
  }
  return ctx;
};

export default useDoses;