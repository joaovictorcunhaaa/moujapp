/**
 * Testes para useOnboarding hook
 */

import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '../useOnboarding';
import { describe, it, expect, beforeEach } from 'vitest';

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default data', () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.data.currentStep).toBe(0);
    expect(result.current.data.completedOnboarding).toBe(false);
  });

  it('should update data', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateData({ name: 'João' });
    });

    expect(result.current.data.name).toBe('João');
  });

  it('should move to next step', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.data.currentStep).toBe(1);
  });

  it('should move to previous step', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });

    expect(result.current.data.currentStep).toBe(2);

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.data.currentStep).toBe(1);
  });

  it('should not go below step 0', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.data.currentStep).toBe(0);
  });

  it('should persist data to localStorage', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateData({
        name: 'Maria',
        email: 'maria@test.com',
      });
    });

    const stored = localStorage.getItem('moujapp-onboarding');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.name).toBe('Maria');
    expect(parsed.email).toBe('maria@test.com');
  });

  it('should reset onboarding', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateData({
        name: 'João',
        currentStep: 5,
        completedOnboarding: true,
      });
    });

    expect(result.current.data.name).toBe('João');
    expect(result.current.data.currentStep).toBe(5);

    act(() => {
      result.current.resetOnboarding();
    });

    expect(result.current.data.currentStep).toBe(0);
    expect(result.current.data.completedOnboarding).toBe(false);
    expect(result.current.data.name).toBeUndefined();
  });

  it('should recover from corrupted localStorage', () => {
    // Simular dados corrompidos
    localStorage.setItem('moujapp-onboarding', '{invalid json}');

    // Hook deve usar fallback
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.data.currentStep).toBe(0);
    expect(result.current.data.completedOnboarding).toBe(false);
  });

  it('should handle multiple updates', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateData({ name: 'João' });
      result.current.updateData({ email: 'joao@test.com' });
      result.current.updateData({ height: 180 });
    });

    expect(result.current.data.name).toBe('João');
    expect(result.current.data.email).toBe('joao@test.com');
    expect(result.current.data.height).toBe(180);
  });

  it('should handle partial updates', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.updateData({
        name: 'João',
        email: 'joao@test.com',
        height: 180,
      });
    });

    // Atualizar apenas um campo
    act(() => {
      result.current.updateData({ height: 175 });
    });

    expect(result.current.data.name).toBe('João');
    expect(result.current.data.email).toBe('joao@test.com');
    expect(result.current.data.height).toBe(175);
  });
});
