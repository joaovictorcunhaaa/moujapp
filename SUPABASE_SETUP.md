# 🔐 Setup Supabase - MoujApp

## 1️⃣ Criar Conta Supabase

1. Ir para [supabase.com](https://supabase.com)
2. Clicar "Start your project"
3. Fazer login com GitHub ou email
4. Criar novo projeto:
   - Nome: `moujapp`
   - Região: Escolher a mais perto (ex: Europe - London para ES)
   - Database password: Guardar em local seguro!
5. Esperar ~2 minutos enquanto provisiona

---

## 2️⃣ Obter Credenciais

Após projeto criado:

1. Menu esquerdo → **Settings** → **API**
2. Copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

3. Menu esquerdo → **Settings** → **Auth**
4. Copiar:
   - `JWT Secret` → `SUPABASE_JWT_SECRET`

---

## 3️⃣ Configurar .env.local

Criar arquivo `.env.local` na raiz do projeto:

```bash
# ===== SUPABASE =====
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here

# ===== BACKEND =====
API_PORT=3000
NODE_ENV=development

# ===== OPENAI =====
OPENAI_API_KEY=sk-...
```

**IMPORTANTE:** Nunca fazer commit do `.env.local`!

---

## 4️⃣ Executar Migrations

### Opção A: Via Dashboard Supabase (Recomendado)

1. No Supabase Dashboard → **SQL Editor**
2. Novo query
3. Copiar e colar conteúdo de `backend/migrations/001_create_tables.sql`
4. Clicar "Run" (botão azul no canto inferior direito)
5. Esperar conclusão ✅

### Opção B: Via CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Executar migrações
supabase migration up
```

---

## 5️⃣ Configurar Autenticação

### Email/Password

No Supabase Dashboard:

1. **Authentication** → **Providers**
2. Verificar que "Email" está habilitado
3. Em **Settings** → **Auth**, scroll para "Email Templates"
4. Usar templates padrão ou customizar

### OAuth (Opcional)

Para login com Google/GitHub:

1. **Providers** → habilitar Google
2. Ir para [Google Cloud Console](https://console.cloud.google.com)
3. Criar OAuth credentials:
   - Type: Web application
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (dev)
4. Copiar Client ID e Secret para Supabase

---

## 6️⃣ Testar Autenticação

### Opção 1: Via Dashboard

1. **Authentication** → **Users**
2. Clicar "Add user"
3. Email e password
4. Criar usuário de teste

### Opção 2: Via API

```bash
# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 7️⃣ Iniciar Backend

```bash
# Instalar dependências
npm install

# Começar desenvolvimento
npm run dev

# Backend em outro terminal:
cd backend && npx ts-node server.ts
```

Backend estará em: `http://localhost:3000`

Frontend: `http://localhost:5173`

---

## 8️⃣ Testar Sincronização

### Adicionar dose via API

```bash
# 1. Login e copiar token
TOKEN="eyJhbGciOi..."

# 2. Adicionar dose
curl -X POST http://localhost:3000/doses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dateISO": "2026-10-06T10:00:00Z",
    "dosageMg": 0.5,
    "medication": "Ozempic",
    "site": "abdomen",
    "notes": "Primeira injeção"
  }'

# 3. Listar doses
curl -X GET http://localhost:3000/doses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9️⃣ Verificar Dados no Dashboard

1. **Database** → Selecionar tabela
2. Ver dados inseridos em tempo real
3. Expandir linhas para ver detalhes

---

## 🔟 Configurar Backups

**⚠️ IMPORTANTE PARA PRODUÇÃO**

1. **Settings** → **Backups**
2. Habilitar "Automatic backups"
3. Frequência: Daily (recomendado)
4. Retenção: 7-30 dias

---

## 🆘 Troubleshooting

### "Invalid API Key"
- ✅ Verificar `.env.local` tem VITE_SUPABASE_URL e chave correta
- ✅ Não adicionar espaços extras

### "User already exists"
- ✅ Usar outro email para teste
- ✅ Ou deletar usuário em Auth → Users

### "RLS policies not working"
- ✅ Verificar se `AUTH.USERS` função está disponível
- ✅ Reexecutar migration
- ✅ Verificar Row Level Security está habilitado

### "CORS error"
- ✅ Verificar `VITE_API_URL` em `.env.local`
- ✅ Adicionar origin ao CORS middleware em `backend/server.ts`

### Banco não conecta
- ✅ Esperar 2-3 minutos após criar projeto
- ✅ Verificar status em Supabase Dashboard
- ✅ Recarregar página

---

## 📚 Recursos

- [Docs Supabase](https://supabase.com/docs)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## ✅ Checklist

- [ ] Conta Supabase criada
- [ ] Credenciais copiadas para `.env.local`
- [ ] Migrations executadas
- [ ] Auth configurada
- [ ] Usuário de teste criado
- [ ] Backend rodando em localhost:3000
- [ ] Frontend conecta ao backend
- [ ] Dose adicionada e sincronizada
- [ ] Dados visíveis no Dashboard

---

**Status:** ✅ Backend pronto para sincronização multi-device!

Próximo passo: **FASE 4 - Testes de API + Deploy**
