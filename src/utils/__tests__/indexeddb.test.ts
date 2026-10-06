/**
 * Testes para IndexedDB
 *
 * Nota: Estes testes precisam de um ambiente que suporte IndexedDB
 * (jsdom ou similar). Vitest + @testing-library/react setup necessário.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DosesIndexedDB, LifestyleIndexedDB } from '../indexeddb';

describe('DosesIndexedDB', () => {
  let db: DosesIndexedDB;

  beforeEach(async () => {
    db = new DosesIndexedDB();
    await db.ensureReady();
    if (db.isAvailable()) {
      await db.clearAll();
    }
  });

  afterEach(async () => {
    if (db.isAvailable()) {
      await db.clearAll();
    }
  });

  it('should initialize database', async () => {
    const ready = await db.ensureReady();
    expect(ready).toBe(true);
  });

  it('should add a dose', async () => {
    if (!db.isAvailable()) {
      console.warn('IndexedDB não disponível, pulando teste');
      return;
    }

    const dose = {
      id: '123',
      dateISO: new Date().toISOString(),
      dosageMg: 0.5,
    };

    const success = await db.addDose(dose);
    expect(success).toBe(true);

    const count = await db.count();
    expect(count).toBe(1);
  });

  it('should get dose by ID', async () => {
    if (!db.isAvailable()) return;

    const dose = {
      id: '123',
      dateISO: new Date().toISOString(),
      dosageMg: 0.5,
    };

    await db.addDose(dose);
    const retrieved = await db.getDoseById('123');

    expect(retrieved).toEqual(dose);
  });

  it('should get all doses with pagination', async () => {
    if (!db.isAvailable()) return;

    // Adicionar 5 doses
    for (let i = 0; i < 5; i++) {
      await db.addDose({
        id: `dose-${i}`,
        dateISO: new Date(Date.now() - i * 1000).toISOString(),
        dosageMg: 0.5 + i * 0.1,
      });
    }

    // Buscar primeiras 3
    const doses = await db.getAllDoses(3, 0);
    expect(doses.length).toBe(3);
    expect(doses[0].dosageMg).toBeGreaterThan(doses[1].dosageMg); // Descending
  });

  it('should remove a dose', async () => {
    if (!db.isAvailable()) return;

    const dose = {
      id: '123',
      dateISO: new Date().toISOString(),
      dosageMg: 0.5,
    };

    await db.addDose(dose);
    let count = await db.count();
    expect(count).toBe(1);

    const success = await db.removeDose('123');
    expect(success).toBe(true);

    count = await db.count();
    expect(count).toBe(0);
  });

  it('should update a dose', async () => {
    if (!db.isAvailable()) return;

    const dose = {
      id: '123',
      dateISO: new Date().toISOString(),
      dosageMg: 0.5,
    };

    await db.addDose(dose);

    const updated = {
      ...dose,
      dosageMg: 1.0,
    };

    const success = await db.updateDose(updated);
    expect(success).toBe(true);

    const retrieved = await db.getDoseById('123');
    expect(retrieved.dosageMg).toBe(1.0);
  });

  it('should export and import data', async () => {
    if (!db.isAvailable()) return;

    // Adicionar dados
    const doses = [
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

    for (const dose of doses) {
      await db.addDose(dose);
    }

    // Exportar
    const exported = await db.exportAll();
    expect(exported.length).toBe(2);

    // Limpar
    await db.clearAll();
    let count = await db.count();
    expect(count).toBe(0);

    // Importar
    const success = await db.importAll(exported);
    expect(success).toBe(true);

    count = await db.count();
    expect(count).toBe(2);
  });

  it('should handle large datasets', async () => {
    if (!db.isAvailable()) return;

    // Adicionar 1000 doses
    for (let i = 0; i < 1000; i++) {
      await db.addDose({
        id: `dose-${i}`,
        dateISO: new Date(Date.now() - i * 1000).toISOString(),
        dosageMg: 0.5,
      });
    }

    const count = await db.count();
    expect(count).toBe(1000);

    // Buscar com paginação
    const page1 = await db.getAllDoses(100, 0);
    const page2 = await db.getAllDoses(100, 100);

    expect(page1.length).toBe(100);
    expect(page2.length).toBe(100);
    expect(page1[0].id).not.toBe(page2[0].id);
  });
});

describe('LifestyleIndexedDB', () => {
  let db: LifestyleIndexedDB;

  beforeEach(async () => {
    db = new LifestyleIndexedDB();
    await db.ensureReady();
    if (db.isAvailable()) {
      await db.clear();
    }
  });

  afterEach(async () => {
    if (db.isAvailable()) {
      await db.clear();
    }
  });

  it('should get and set lifestyle data', async () => {
    if (!db.isAvailable()) return;

    const data = {
      activityLevel: 'moderately-active' as const,
      weight: 75,
      waterGoal: 2.5,
      calorieGoal: 2000,
    };

    const success = await db.set(data);
    expect(success).toBe(true);

    const retrieved = await db.get();
    expect(retrieved.activityLevel).toBe('moderately-active');
    expect(retrieved.weight).toBe(75);
  });

  it('should handle null when no data exists', async () => {
    if (!db.isAvailable()) return;

    const data = await db.get();
    expect(data).toBeNull();
  });
});
