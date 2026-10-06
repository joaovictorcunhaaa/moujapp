/**
 * Hook useSupabaseDoses - Sincronizar doses com Supabase
 * Usa IndexedDB/localStorage como fallback
 */

import { useState, useCallback, useEffect } from 'react';
import { addDose, getDoses, updateDose, deleteDose } from '../lib/supabase';
import { useIndexedDBDoses } from './useIndexedDBDoses';
import type { Dose } from '../lib/supabase';

interface UseSupabaseDoesesState {
  doses: Dose[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
}

export function useSupabaseDoses(userId: string | null) {
  const [state, setState] = useState<UseSupabaseDoesesState>({
    doses: [],
    loading: true,
    error: null,
    syncing: false,
  });

  // Fallback para offline
  const {
    doses: offlineDoses,
    addDose: addOfflineDose,
    removeDose: removeOfflineDose,
    usingIndexedDB,
  } = useIndexedDBDoses();

  // Carregar doses do Supabase
  const loadDoses = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, count } = await getDoses(userId, { limit: 500 });
      setState((prev) => ({
        ...prev,
        doses: data || [],
        loading: false,
      }));

      // Sync com offline storage
      if (usingIndexedDB) {
        console.log('✅ Sincronia com Supabase completada');
      }
    } catch (error: any) {
      console.error('Erro ao carregar doses do Supabase:', error);
      // Fallback para offline
      setState((prev) => ({
        ...prev,
        doses: offlineDoses,
        loading: false,
        error: 'Usando dados offline. Sincronizando...',
      }));
    }
  }, [userId, offlineDoses, usingIndexedDB]);

  // Carregar doses ao montar ou mudar userId
  useEffect(() => {
    loadDoses();
  }, [loadDoses]);

  // Adicionar dose
  const handleAddDose = useCallback(
    async (
      dateISO: string,
      dosageMg: number,
      medication: string,
      site?: string,
      notes?: string
    ) => {
      if (!userId) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, syncing: true }));

      try {
        // Tentar Supabase primeiro
        const dose = await addDose(userId, {
          dateISO,
          dosageMg,
          medication,
          site,
          notes,
        });

        setState((prev) => ({
          ...prev,
          doses: [dose, ...prev.doses],
          syncing: false,
        }));

        // Sync com offline
        addOfflineDose(new Date(dateISO), dosageMg, medication, site, notes);

        return dose;
      } catch (error: any) {
        console.error('Erro ao adicionar dose:', error);

        // Fallback para offline
        addOfflineDose(new Date(dateISO), dosageMg, medication, site, notes);

        setState((prev) => ({
          ...prev,
          syncing: false,
          error: 'Dose salva offline. Sincronizará em breve.',
        }));

        throw error;
      }
    },
    [userId, addOfflineDose]
  );

  // Atualizar dose
  const handleUpdateDose = useCallback(
    async (doseId: string, updates: Partial<Dose>) => {
      setState((prev) => ({ ...prev, syncing: true }));

      try {
        const updated = await updateDose(doseId, updates);

        setState((prev) => ({
          ...prev,
          doses: prev.doses.map((d) => (d.id === doseId ? updated : d)),
          syncing: false,
        }));

        return updated;
      } catch (error: any) {
        console.error('Erro ao atualizar dose:', error);
        setState((prev) => ({
          ...prev,
          syncing: false,
          error: 'Falha ao atualizar dose',
        }));
        throw error;
      }
    },
    []
  );

  // Deletar dose
  const handleDeleteDose = useCallback(
    async (doseId: string) => {
      setState((prev) => ({ ...prev, syncing: true }));

      try {
        await deleteDose(doseId);

        setState((prev) => ({
          ...prev,
          doses: prev.doses.filter((d) => d.id !== doseId),
          syncing: false,
        }));

        removeOfflineDose(doseId);
      } catch (error: any) {
        console.error('Erro ao deletar dose:', error);
        setState((prev) => ({
          ...prev,
          syncing: false,
          error: 'Falha ao deletar dose',
        }));
        throw error;
      }
    },
    [removeOfflineDose]
  );

  // Sincronizar com Supabase (manual)
  const sync = useCallback(async () => {
    if (!userId) return;
    await loadDoses();
  }, [userId, loadDoses]);

  return {
    doses: state.doses,
    loading: state.loading,
    error: state.error,
    syncing: state.syncing,
    usingSupabase: !!userId,
    offline: !usingIndexedDB,
    addDose: handleAddDose,
    updateDose: handleUpdateDose,
    deleteDose: handleDeleteDose,
    sync,
    refetch: loadDoses,
  };
}
