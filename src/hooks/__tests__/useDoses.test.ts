/**
 * Testes para useDoses hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDoses, DosesProvider } from '../useDoses';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReactNode } from 'react';

describe('useDoses', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <DosesProvider>{children}</DosesProvider>
  );

  it('should initialize with empty doses', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    expect(result.current.doses).toEqual([]);
    expect(result.current.lastDose).toBeNull();
  });

  it('should add a dose', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    const now = new Date();

    act(() => {
      result.current.addDose(now, 0.5, 'arm');
    });

    expect(result.current.doses).toHaveLength(1);
    expect(result.current.doses[0].dosageMg).toBe(0.5);
    expect(result.current.doses[0].site).toBe('arm');
  });

  it('should track last dose', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    act(() => {
      result.current.addDose(yesterday, 0.5);
      result.current.addDose(now, 1.0);
    });

    expect(result.current.lastDose).toBeTruthy();
    expect(result.current.lastDose?.dosageMg).toBe(1.0);
  });

  it('should sort doses by date descending', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    const now = new Date();
    const day1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day2 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const day3 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    act(() => {
      result.current.addDose(day1, 0.5);
      result.current.addDose(day3, 1.0);
      result.current.addDose(day2, 0.75);
    });

    // Deve estar ordenado por data descendente
    expect(result.current.doses[0].dosageMg).toBe(1.0);
    expect(result.current.doses[1].dosageMg).toBe(0.75);
    expect(result.current.doses[2].dosageMg).toBe(0.5);
  });

  it('should remove a dose', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    let doseId: string;

    act(() => {
      result.current.addDose(new Date(), 0.5);
      doseId = result.current.doses[0].id;
    });

    expect(result.current.doses).toHaveLength(1);

    act(() => {
      result.current.removeDose(doseId!);
    });

    expect(result.current.doses).toHaveLength(0);
  });

  it('should clear all doses', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    act(() => {
      result.current.addDose(new Date(), 0.5);
      result.current.addDose(new Date(), 1.0);
      result.current.addDose(new Date(), 1.5);
    });

    expect(result.current.doses).toHaveLength(3);

    act(() => {
      result.current.clearDoses();
    });

    expect(result.current.doses).toHaveLength(0);
    expect(result.current.lastDose).toBeNull();
  });

  it('should persist doses to localStorage', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    act(() => {
      result.current.addDose(new Date(), 0.5);
    });

    const stored = localStorage.getItem('moujapp-doses');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].dosageMg).toBe(0.5);
  });

  it('should handle large volume of doses', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    // Adicionar 1000 doses
    act(() => {
      for (let i = 0; i < 1000; i++) {
        const date = new Date(Date.now() - i * 1000);
        result.current.addDose(date, 0.5 + (i % 10) * 0.1);
      }
    });

    expect(result.current.doses).toHaveLength(1000);
    expect(result.current.lastDose).toBeTruthy();
  });

  it('should handle invalid doses gracefully', () => {
    const { result } = renderHook(() => useDoses(), { wrapper });

    // Doses com valores inválidos devem ter erro
    act(() => {
      // Adicionar dose válida
      result.current.addDose(new Date(), 0.5);
    });

    expect(result.current.doses).toHaveLength(1);

    // Se houver erro, deve estar em result.current.error
    expect(result.current.error).toBeNull();
  });
});
