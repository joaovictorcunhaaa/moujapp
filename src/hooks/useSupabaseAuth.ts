/**
 * Hook useSupabaseAuth - Gerenciar autenticação com Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, onAuthStateChange, register, login, logout } from '../lib/supabase';
import type { User as AuthUser } from '@supabase/supabase-js';

interface UseSupabaseAuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useSupabaseAuth() {
  const [state, setState] = useState<UseSupabaseAuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Inicializar e escutar mudanças de autenticação
  useEffect(() => {
    // Obter usuário atual
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        setState((prev) => ({
          ...prev,
          user,
          loading: false,
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    const unsubscribe = onAuthStateChange((user) => {
      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Registrar
  const handleRegister = useCallback(
    async (email: string, password: string, name: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { user } = await register(email, password, name);
        setState((prev) => ({
          ...prev,
          user,
          loading: false,
          error: null,
        }));
        return user;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  // Login
  const handleLogin = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { user } = await login(email, password);
      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        error: null,
      }));
      return user;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Logout
  const handleLogout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await logout();
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!state.user,
  };
}
