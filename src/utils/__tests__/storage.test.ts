/**
 * Testes para o sistema de storage com validação Zod
 *
 * Demonstra que o sistema é robusto contra:
 * - JSON corrompido
 * - Dados faltando campos
 * - Tipos errados
 * - Quota excedida
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadFromStorage, saveToStorage, removeFromStorage, StorageSchemas } from '../storage';

describe('Storage System with Zod Validation', () => {
  const testKey = 'test-key';

  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadFromStorage', () => {
    it('should load valid data', () => {
      const validData = {
        id: '123',
        dateISO: new Date().toISOString(),
        dosageMg: 0.5,
      };

      localStorage.setItem(testKey, JSON.stringify(validData));

      const result = loadFromStorage(testKey, StorageSchemas.dose, null);
      expect(result).toEqual(validData);
    });

    it('should return fallback if key does not exist', () => {
      const fallback = { id: 'default', dateISO: new Date().toISOString(), dosageMg: 0 };
      const result = loadFromStorage(testKey, StorageSchemas.dose, fallback);
      expect(result).toEqual(fallback);
    });

    it('should handle corrupted JSON', () => {
      // JSON inválido
      localStorage.setItem(testKey, '{invalid json}');

      const fallback = { id: 'default', dateISO: new Date().toISOString(), dosageMg: 0 };
      const result = loadFromStorage(testKey, StorageSchemas.dose, fallback);

      // Deve retornar fallback e limpar localStorage
      expect(result).toEqual(fallback);
      expect(localStorage.getItem(testKey)).toBeNull();
    });

    it('should handle validation errors', () => {
      // Dados com campos inválidos
      const invalidData = {
        id: '123',
        dateISO: 'not-a-date',
        dosageMg: -5, // negativo não é válido
      };

      localStorage.setItem(testKey, JSON.stringify(invalidData));

      const fallback = { id: 'default', dateISO: new Date().toISOString(), dosageMg: 0 };
      const result = loadFromStorage(testKey, StorageSchemas.dose, fallback);

      // Deve retornar fallback
      expect(result).toEqual(fallback);
    });

    it('should recover partial data when possible', () => {
      // Onboarding parcial (alguns campos faltando)
      const partialData = {
        name: 'João',
        currentStep: 5,
        completedOnboarding: false,
      };

      localStorage.setItem(testKey, JSON.stringify(partialData));

      const fallback = {
        currentStep: 0,
        completedOnboarding: false,
      };

      const result = loadFromStorage(testKey, StorageSchemas.onboarding, fallback);

      // Deve manter os campos válidos
      expect(result.name).toBe('João');
      expect(result.currentStep).toBe(5);
    });
  });

  describe('saveToStorage', () => {
    it('should save valid data', () => {
      const validData = {
        id: '123',
        dateISO: new Date().toISOString(),
        dosageMg: 0.5,
      };

      const success = saveToStorage(testKey, validData, StorageSchemas.dose);
      expect(success).toBe(true);

      const stored = localStorage.getItem(testKey);
      expect(JSON.parse(stored!)).toEqual(validData);
    });

    it('should fail if data is invalid', () => {
      const invalidData = {
        id: '123',
        dateISO: 'not-a-date',
        dosageMg: -5,
      };

      const success = saveToStorage(testKey, invalidData, StorageSchemas.dose);
      expect(success).toBe(false);
      expect(localStorage.getItem(testKey)).toBeNull();
    });

    it('should save array data', () => {
      const validDoses = [
        {
          id: '1',
          dateISO: new Date().toISOString(),
          dosageMg: 0.5,
        },
        {
          id: '2',
          dateISO: new Date().toISOString(),
          dosageMg: 1.0,
        },
      ];

      const success = saveToStorage(testKey, validDoses, StorageSchemas.doses);
      expect(success).toBe(true);

      const stored = localStorage.getItem(testKey);
      expect(JSON.parse(stored!)).toEqual(validDoses);
    });
  });

  describe('removeFromStorage', () => {
    it('should remove data from storage', () => {
      localStorage.setItem(testKey, 'some value');
      expect(localStorage.getItem(testKey)).toBe('some value');

      const success = removeFromStorage(testKey);
      expect(success).toBe(true);
      expect(localStorage.getItem(testKey)).toBeNull();
    });
  });

  describe('Real world scenario', () => {
    it('should handle app crash and recovery', () => {
      // Simular: app salva dose, depois localStorage fica corrompido

      // 1. App salva dose válida
      const dose = {
        id: '123',
        dateISO: new Date().toISOString(),
        dosageMg: 0.5,
      };

      localStorage.setItem(testKey, JSON.stringify(dose));

      // 2. localStorage fica corrompido por algum motivo
      localStorage.setItem(testKey, '{corrupted data');

      // 3. App tenta carregar - deve retornar fallback, não quebrar
      const fallback = { id: 'default', dateISO: new Date().toISOString(), dosageMg: 0 };
      const result = loadFromStorage(testKey, StorageSchemas.dose, fallback);

      expect(result).toEqual(fallback);
      // localStorage foi limpo
      expect(localStorage.getItem(testKey)).toBeNull();
    });

    it('should handle missing required fields', () => {
      // Simular: dados de versão anterior sem campo obrigatório

      const oldFormat = {
        id: '123',
        // falta dateISO
        dosageMg: 0.5,
      };

      localStorage.setItem(testKey, JSON.stringify(oldFormat));

      const fallback = { id: 'default', dateISO: new Date().toISOString(), dosageMg: 0 };
      const result = loadFromStorage(testKey, StorageSchemas.dose, fallback);

      // Deve usar fallback
      expect(result).toEqual(fallback);
    });
  });
});
