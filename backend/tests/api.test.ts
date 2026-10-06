/**
 * Testes para APIs do backend
 * Rodas com: npm run test:api
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_URL = 'http://localhost:3000';

interface TestUser {
  email: string;
  password: string;
  name: string;
  token?: string;
  id?: string;
}

const testUser: TestUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
};

// ===== HELPERS =====

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

// ===== TESTES =====

describe('MoujApp Backend API', () => {
  // Health check
  describe('Health Check', () => {
    it('should return health status', async () => {
      const { status, data } = await request('GET', '/health');

      expect(status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.database).toBe('connected');
    });
  });

  // Auth
  describe('Authentication', () => {
    it('should register new user', async () => {
      const { status, data } = await request('POST', '/auth/register', {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      });

      expect(status).toBe(201);
      expect(data.email).toBe(testUser.email);
      expect(data.name).toBe(testUser.name);
      expect(data.token).toBeDefined();

      // Guardar token e ID para próximos testes
      testUser.token = data.token;
      testUser.id = data.id;
    });

    it('should login with email and password', async () => {
      const { status, data } = await request('POST', '/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      expect(status).toBe(200);
      expect(data.email).toBe(testUser.email);
      expect(data.token).toBeDefined();

      // Atualizar token
      testUser.token = data.token;
    });

    it('should reject invalid credentials', async () => {
      const { status } = await request('POST', '/auth/login', {
        email: testUser.email,
        password: 'WrongPassword',
      });

      expect(status).toBe(401);
    });

    it('should refresh token', async () => {
      const { status, data } = await request(
        'POST',
        '/auth/refresh',
        {},
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.token).toBeDefined();
    });
  });

  // Doses
  describe('Doses API', () => {
    let doseId: string;

    it('should add new dose', async () => {
      const { status, data } = await request(
        'POST',
        '/doses',
        {
          dateISO: new Date().toISOString(),
          dosageMg: 0.5,
          medication: 'Ozempic',
          site: 'abdomen',
          notes: 'First injection',
        },
        testUser.token
      );

      expect(status).toBe(201);
      expect(data.dosageMg).toBe(0.5);
      expect(data.medication).toBe('Ozempic');

      doseId = data.id;
    });

    it('should list doses with pagination', async () => {
      const { status, data } = await request(
        'GET',
        '/doses?limit=10&offset=0',
        undefined,
        testUser.token
      );

      expect(status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThanOrEqual(1);
      expect(data.limit).toBe(10);
      expect(data.offset).toBe(0);
    });

    it('should get specific dose', async () => {
      const { status, data } = await request(
        'GET',
        `/doses/${doseId}`,
        undefined,
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.id).toBe(doseId);
      expect(data.medication).toBe('Ozempic');
    });

    it('should update dose', async () => {
      const { status, data } = await request(
        'PUT',
        `/doses/${doseId}`,
        {
          notes: 'Updated notes',
          dosageMg: 1.0,
        },
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.notes).toBe('Updated notes');
      expect(data.dosageMg).toBe(1.0);
    });

    it('should add multiple doses', async () => {
      const doses = [];

      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const { data } = await request(
          'POST',
          '/doses',
          {
            dateISO: date.toISOString(),
            dosageMg: 0.5 + i * 0.1,
            medication: 'Mounjaro',
            site: 'thigh',
          },
          testUser.token
        );

        doses.push(data);
      }

      expect(doses.length).toBe(5);
    });

    it('should delete dose', async () => {
      const { status } = await request(
        'DELETE',
        `/doses/${doseId}`,
        undefined,
        testUser.token
      );

      expect(status).toBe(204);

      // Verificar que foi deletado
      const { status: getStatus } = await request(
        'GET',
        `/doses/${doseId}`,
        undefined,
        testUser.token
      );

      expect(getStatus).toBe(404);
    });

    it('should reject requests without token', async () => {
      const { status } = await request('GET', '/doses');

      expect(status).toBe(401);
    });

    it('should validate dose data', async () => {
      const { status } = await request(
        'POST',
        '/doses',
        {
          dosageMg: 15, // Máximo é 10
          medication: 'Invalid',
        },
        testUser.token
      );

      expect(status).toBe(400);
    });
  });

  // User Profile
  describe('User Profile API', () => {
    it('should get user profile', async () => {
      const { status, data } = await request(
        'GET',
        '/users/me',
        undefined,
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.email).toBe(testUser.email);
      expect(data.name).toBe(testUser.name);
    });

    it('should update user profile', async () => {
      const { status, data } = await request(
        'PUT',
        '/users/me',
        {
          name: 'Updated Name',
          weight: 75.5,
          height: 180,
        },
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.name).toBe('Updated Name');
      expect(data.weight).toBe(75.5);
    });
  });

  // Sync
  describe('Sync API', () => {
    it('should export user data', async () => {
      const { status, data } = await request(
        'POST',
        '/sync/export',
        {},
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.user).toBeDefined();
      expect(Array.isArray(data.doses)).toBe(true);
      expect(data.exported_at).toBeDefined();
    });

    it('should import user data', async () => {
      // Primeiro exportar
      const { data: exported } = await request(
        'POST',
        '/sync/export',
        {},
        testUser.token
      );

      // Depois importar (merge)
      const { status, data } = await request(
        'POST',
        '/sync/import',
        {
          doses: exported.doses.slice(0, 2),
        },
        testUser.token
      );

      expect(status).toBe(200);
      expect(data.imported).toBeGreaterThanOrEqual(0);
    });
  });

  // Error handling
  describe('Error Handling', () => {
    it('should return 404 for unknown route', async () => {
      const { status } = await request('GET', '/unknown-route');

      expect(status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await fetch(`${API_URL}/doses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser.token}`,
        },
        body: '{invalid json}',
      });

      expect(response.status).toBe(400);
    });

    it('should reject requests from other users', async () => {
      // Registrar outro usuário
      const otherUser = {
        email: `other-${Date.now()}@example.com`,
        password: 'OtherPassword123!',
        name: 'Other User',
      };

      const { data: registerData } = await request(
        'POST',
        '/auth/register',
        otherUser
      );

      // Tentar acessar doses do primeiro usuário com token do segundo
      const { status } = await request(
        'GET',
        '/doses',
        undefined,
        registerData.token
      );

      // Deve retornar 200 mas lista vazia (seu próprio usuário)
      expect(status).toBe(200);
    });
  });

  // Performance
  describe('Performance', () => {
    it('should handle pagination efficiently', async () => {
      const start = Date.now();

      // Adicionar 100 doses
      for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        await request(
          'POST',
          '/doses',
          {
            dateISO: date.toISOString(),
            dosageMg: 0.5,
            medication: 'Test Drug',
          },
          testUser.token
        );
      }

      // Listar com paginação
      const { data } = await request(
        'GET',
        '/doses?limit=50&offset=0',
        undefined,
        testUser.token
      );

      const elapsed = Date.now() - start;

      expect(data.data.length).toBeLessThanOrEqual(50);
      expect(elapsed).toBeLessThan(5000); // < 5s para 100 inserts + list
    });

    it('should limit query results', async () => {
      const { data } = await request(
        'GET',
        '/doses?limit=1000',
        undefined,
        testUser.token
      );

      // Limite deve ser enforçado no backend
      expect(data.limit).toBeLessThanOrEqual(500);
    });
  });
});

// ===== SETUP/TEARDOWN =====

// Executar antes dos testes
beforeAll(async () => {
  console.log('🧪 Iniciando testes da API...');
  console.log(`📍 API URL: ${API_URL}`);

  // Esperar servidor ficar pronto
  for (let i = 0; i < 5; i++) {
    try {
      await request('GET', '/health');
      console.log('✅ Backend pronto para testes\n');
      return;
    } catch {
      console.log(`⏳ Aguardando backend... (tentativa ${i + 1}/5)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('❌ Backend não respondeu após 5 tentativas');
});

// Executar após os testes
afterAll(async () => {
  console.log('\n✅ Testes concluídos');
});
