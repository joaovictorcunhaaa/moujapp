# 🚀 DEPLOY GUIDE - MoujApp

**Status:** Produção-ready  
**Tempo de deploy:** ~15 minutos  
**Custo:** ~$20-50/mês (Vercel + Railway)

---

## 📋 PRÉ-REQUISITOS

- [ ] GitHub account com repo enviado
- [ ] Vercel account (vercel.com)
- [ ] Railway account (railway.app)
- [ ] Supabase projeto criado
- [ ] Todas as variáveis de ambiente prontas

---

## 🔧 PARTE 1: Preparar Variáveis de Ambiente

### 1️⃣ Copiar credenciais Supabase

Do Dashboard Supabase:
```
Settings → API
  → VITE_SUPABASE_URL
  → VITE_SUPABASE_ANON_KEY
  
Settings → Auth
  → SUPABASE_JWT_SECRET
  
Settings → Service Role
  → SUPABASE_SERVICE_ROLE_KEY
```

### 2️⃣ Variáveis necessárias

```env
# Frontend (Vercel)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://moujapp-backend.railway.app

# Backend (Railway)
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your-secret
API_PORT=3000
NODE_ENV=production
OPENAI_API_KEY=sk-...
```

---

## 🚀 PARTE 2: Deploy Frontend (Vercel)

### 1️⃣ Conectar repositório

1. Ir para [vercel.com](https://vercel.com)
2. Login com GitHub
3. Clicar "New Project"
4. Selecionar repositório `moujapp`
5. Clicar "Import"

### 2️⃣ Configurar variáveis

1. **Environment Variables**
2. Adicionar:
   ```
   VITE_SUPABASE_URL = https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   VITE_API_URL = https://moujapp-backend.railway.app
   ```
3. Selecionar "Production" e "Preview"
4. Clicar "Save"

### 3️⃣ Deploy

1. Clicar "Deploy"
2. Esperar build completar (~3 min)
3. Copiar URL: `https://moujapp-xxxx.vercel.app`

### ✅ Verificar
```bash
curl https://moujapp-xxxx.vercel.app/health
# Deve retornar: {"status":"ok",...}
```

---

## 🚀 PARTE 3: Deploy Backend (Railway)

### 1️⃣ Conectar repositório

1. Ir para [railway.app](https://railway.app)
2. Dashboard → "New Project"
3. "Deploy from GitHub repo"
4. Conectar GitHub
5. Selecionar `joaovictorcunhaaa/moujapp`
6. Clicar "Create"

### 2️⃣ Configurar variáveis

1. Em Railway Dashboard:
   - Selecionar "moujapp-backend"
   - "Variables"
   - Adicionar:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   SUPABASE_JWT_SECRET=your-secret
   API_PORT=3000
   NODE_ENV=production
   OPENAI_API_KEY=sk-...
   ```

### 3️⃣ Build settings

1. **Settings** → "Build"
2. Build command: `npm install && npm run build`
3. Start command: `node dist/backend/server.js`
4. Root directory: `.` (raiz)

### 4️⃣ Deploy

1. Railway detecta mudanças no GitHub automaticamente
2. Ir para "Deployments"
3. Acompanhar build (logs aparecem em tempo real)
4. Quando pronto, copiar URL: `https://moujapp-backend-xxxx.railway.app`

### ✅ Verificar
```bash
curl https://moujapp-backend-xxxx.railway.app/health
# Deve retornar: {"status":"ok",...}
```

---

## 🔄 PARTE 4: Configurar CI/CD

### 1️⃣ Habilitar GitHub Actions

O arquivo `.github/workflows/ci-cd.yml` já existe!

Ele roda automaticamente quando faz push:
- ✅ Lint e testes
- ✅ Coverage
- ✅ Build
- ✅ E2E tests
- ✅ Deploy automático

### 2️⃣ Adicionar secrets ao GitHub

1. Ir para repo → Settings → Secrets
2. Adicionar:
   ```
   VERCEL_TOKEN = (de vercel.com/account/tokens)
   VERCEL_ORG_ID = (do Vercel)
   VERCEL_PROJECT_ID = (do Vercel)
   
   RAILWAY_TOKEN = (de railway.app/account/tokens)
   
   VITE_SUPABASE_URL = https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   SUPABASE_JWT_SECRET = your-secret
   VITE_API_URL_PROD = https://moujapp-backend-xxxx.railway.app
   
   SLACK_WEBHOOK = (opcional, para notificações)
   ```

### 3️⃣ Testar

Fazer push para main:
```bash
git push origin main
```

GitHub Actions começará automaticamente:
1. Ir para **Actions** tab
2. Ver pipeline rodando
3. Todos os testes devem passar ✅
4. Deploy automático para Vercel + Railway

---

## 📊 VERIFICAÇÕES PÓS-DEPLOY

### ✅ Health Checks

```bash
# Frontend
curl https://moujapp-xxxx.vercel.app/
# Deve retornar HTML da app

# Backend
curl https://moujapp-backend-xxxx.railway.app/health
# Deve retornar: {"status":"ok","database":"connected",...}
```

### ✅ Funcionalidade

1. Abrir app no browser
2. Registrar usuário
3. Fazer login
4. Adicionar dose
5. Verificar sincronização

### ✅ Logs

**Vercel:**
- Dashboard → Deployments → Logs

**Railway:**
- Dashboard → Deployments → Logs

---

## 🔐 SEGURANÇA PÓS-DEPLOY

### 1️⃣ HTTPS obrigatório
```
Vercel: automático ✅
Railway: automático ✅
```

### 2️⃣ CORS configurado
```
Backend aceita apenas:
- https://moujapp-xxxx.vercel.app
- localhost:5173 (dev)
```

### 3️⃣ Rate limiting
```
Backend: 10 req/min por IP
Vercel: Edge network
Railway: Cloudflare protection
```

### 4️⃣ Secrets não exposto
```
❌ Nunca fazer commit de .env
✅ Usar GitHub Secrets
✅ Usar Vercel/Railway env vars
```

---

## 📈 MONITORAMENTO

### 1️⃣ Vercel Analytics
```
Dashboard → Analytics
- Page views
- Response times
- Errors
```

### 2️⃣ Railway Metrics
```
Dashboard → Monitoring
- CPU usage
- Memory
- Network
- Deployment status
```

### 3️⃣ Supabase Monitoring
```
Dashboard → Monitoring
- Query performance
- Database connections
- Auth events
```

---

## 🆘 TROUBLESHOOTING

### Build fails no Vercel
```
❌ Error: VITE_SUPABASE_URL not defined
✅ Solução: Adicionar em Vercel → Settings → Environment
```

### Backend não conecta ao banco
```
❌ Error: ECONNREFUSED to database
✅ Solução: Verificar VITE_SUPABASE_URL no Railway
```

### CORS error em produção
```
❌ Error: CORS policy blocks request
✅ Solução: Verificar backend CORS config
   Adicionar origin: https://moujapp-xxxx.vercel.app
```

### GitHub Actions não roda
```
❌ Action failed: permission denied
✅ Solução: Verificar GitHub Secrets estão corretos
```

---

## 🔄 DEPLOYMENT WORKFLOW

### Desenvolvimento
```
git checkout -b feature/xyz
# ... código ...
git push origin feature/xyz
# → GitHub Actions roda testes
# → Review → Pull Request
```

### Produção
```
git checkout main
git pull origin main
# Merge PR
# → GitHub Actions detecta push
# → Testes passam ✅
# → Deploy automático para Vercel
# → Deploy automático para Railway
```

---

## 📝 COMANDOS ÚTEIS

### Build local (antes de push)
```bash
npm run build
npm run test:all
```

### Logs do Railway
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Ver logs
railway logs
```

### Logs do Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Ver logs
vercel logs
```

---

## ✅ CHECKLIST FINAL

- [ ] Variáveis Supabase copiadas
- [ ] Repo no GitHub
- [ ] Vercel conectado e configurado
- [ ] Railway conectado e configurado
- [ ] GitHub Secrets adicionados
- [ ] CI/CD pipeline testado
- [ ] Frontend deploys com sucesso
- [ ] Backend deploys com sucesso
- [ ] Health checks passam
- [ ] Usuário consegue registrar e logar
- [ ] Doses sincronizam
- [ ] Logs são acessíveis
- [ ] Monitoramento configurado

---

## 🎯 PRÓXIMOS PASSOS

### 1️⃣ Beta Testing (1 semana)
- Sua irmã usa o app
- Coleta feedback
- Bugs encontrados

### 2️⃣ Melhorias
- Fix bugs
- Add features baseado em feedback
- Optimizar performance

### 3️⃣ Monetização
- Setup Stripe
- Implementar subscription
- Launch público

---

## 📚 RECURSOS

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Supabase Docs](https://supabase.com/docs)

---

**Status:** ✅ Pronto para deploy  
**Tempo:** ~15 minutos para setup  
**Custo:** ~$20-50/mês

🎉 **Seu app está online em produção!**
