# 🚀 PRÓXIMOS PASSOS - Semana por Semana

**Status:** ✅ FASE 1 COMPLETA  
**Data:** 2026-10-06  
**Objetivo:** Levar MoujApp de seguro → testado → backend → monetizado em 13 semanas

---

## ⚠️ ANTES DE COMEÇAR

```bash
# Verificar que Zod está instalado
npm list zod

# Se não tiver, instalar:
npm install zod
```

---

## 📋 CHECKLIST IMEDIATO (HOJE/AMANHÃ)

### 1. **Testar localmente** ✅
```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Deve ver:
# ✅ App funcionando em http://localhost:8080
# ✅ Disclaimer aparecendo na primeira vez
# ✅ Depois de aceitar, redireciona para onboarding
```

### 2. **Testar rate limiting**
```bash
# Enviar mais de 10 requests em 60s para a API
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/analyze-meal \
    -H "Content-Type: application/json" \
    -d '{"image": "data:image/jpeg;base64,fake"}'
  sleep 1
done

# Esperado: Requests 11-15 retornam 429 (Too Many Requests)
```

### 3. **Testar disclaimer**
- Abrir app em browser incógnito (nova sessão)
- Verificar que banner aparece
- Verificar que não pode continuar sem aceitar
- Aceitar e verificar que redireciona

### 4. **Verificar commits**
```bash
git log --oneline -10
# Deve ver os 2 commits novos:
# - Segurança crítica
# - Disclaimer integrado
```

---

## 📅 SEMANA 1 (AGORA) - FINALIZAR FASE 1

### Dia 1-2: Testes & Verificação
- [ ] Executar `npm run dev` e testar localmente
- [ ] Verificar que disclaimer aparece
- [ ] Testar rate limiting (curl loop)
- [ ] Confirmar que não há erros no console

### Dia 3-4: Deploy para staging
- [ ] Fazer deploy da branch `main` para Vercel staging
- [ ] Testar em staging (URL de staging)
- [ ] Verificar que disclaimer funciona em produção
- [ ] Testar rate limiting em produção

### Dia 5-7: Documentação & Preparação
- [ ] Revisar LEGAL_DISCLAIMERS.md
- [ ] Revisar SECURITY_IMPROVEMENTS_SUMMARY.md
- [ ] Preparar irmã para gravar vídeos (compliance-safe)
- [ ] Criar conta de teste no Meta Business Manager

### Entregáveis da Semana 1:
✅ App funcionando com disclaimer obrigatório  
✅ Rate limiting ativo  
✅ Logging configurado  
✅ Deploy em staging funcionando  
✅ Documentação de segurança pronta  

---

## 🧪 SEMANA 2-3 - TESTES (FASE 2 INÍCIO)

### Objetivo: Garantir que app é robusto antes de ads

### Dia 1-3: Setup Vitest
```bash
npm install -D vitest @testing-library/react @testing-library/user-event

# Criar arquivo de teste:
# src/__tests__/utils/security.test.ts
# Testar: checkRateLimit, Logger
```

### Dia 4-7: Testes E2E
```bash
npm install -D @playwright/test

# Criar testes para:
# 1. Disclaimer aparece
# 2. Rate limiting bloqueia
# 3. Chat com IA funciona
# 4. Análise de foto funciona
# 5. localStorage valida dados
```

### Dia 8-10: Performance Audit
```bash
npm run build
npm run preview

# Abrir http://localhost:4173
# Rodar Lighthouse (Chrome DevTools)
# Goal: Score > 90 em Performance
```

### Entregáveis da Semana 2-3:
✅ Testes unitários passando (70% coverage)  
✅ Testes E2E passando  
✅ Lighthouse score > 90  
✅ Nenhum erro em produção  

---

## 🔧 SEMANA 4-6 - BACKEND (FASE 2)

### Objetivo: Criar backend seguro para sync de dados

### Setup Vercel (Recomendado)
Você já tem Vercel Functions configuradas. Apenas expandir:

```bash
# Se precisar de banco de dados, usar Supabase:
# 1. Criar conta em https://supabase.com
# 2. Criar novo projeto
# 3. Pegar SUPABASE_URL e SUPABASE_KEY
# 4. Adicionar em .env.local:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key
```

### Criar tabelas:
```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP
);

-- Tabela de doses
CREATE TABLE doses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date_iso TIMESTAMP,
  dosage_mg FLOAT,
  site TEXT,
  created_at TIMESTAMP
);

-- Tabela de lifestyle
CREATE TABLE lifestyle (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity_level TEXT,
  water_goal FLOAT,
  calorie_goal FLOAT,
  updated_at TIMESTAMP
);
```

### APIs necessárias:
```
POST   /api/auth/signup       - Registrar usuário
POST   /api/auth/login        - Login com email/OTP
GET    /api/doses             - Listar doses
POST   /api/doses             - Adicionar dose
DELETE /api/doses/:id         - Remover dose
GET    /api/lifestyle         - Pegar config
POST   /api/lifestyle         - Salvar config
```

### Entregáveis da Semana 4-6:
✅ Backend rodando em Vercel  
✅ Database (Supabase) criado  
✅ Autenticação funcionando  
✅ APIs CRUD prontas  
✅ Testes de API passando  

---

## 🔀 SEMANA 7-8 - INTEGRAÇÃO (FASE 2)

### Objetivo: Frontend sincronizando com Backend

### Instalar React Query:
```bash
npm install @tanstack/react-query
```

### Criar hooks para API:
```typescript
// src/hooks/useApi.ts
- useDoses() - GET/POST doses
- useLifestyle() - GET/POST lifestyle
- useAuth() - Login/signup
- useSyncWithBackend() - Sincronizar dados
```

### Implementar sync automático:
```typescript
// Quando online: sync com backend
// Quando offline: usar localStorage
// Quando volta online: sincronizar
```

### Migração de dados:
```typescript
// 1. Carregar dados do localStorage
// 2. Se não está no backend, fazer upload
// 3. Depois, sincronizar em tempo real
```

### Entregáveis da Semana 7-8:
✅ Frontend comunicando com backend  
✅ Sync automático funcionando  
✅ Offline-first implementado  
✅ Testes E2E com backend passando  
✅ Multi-device sync funcionando  

---

## 💰 SEMANA 9-10 - MONETIZAÇÃO (FASE 3)

### Objetivo: Configurar pagamentos com Stripe

### Setup Stripe:
```bash
# 1. Criar conta em https://stripe.com
# 2. Pegar chaves (public e secret)
# 3. npm install stripe
```

### Criar planos:
```
✅ Free (sempre grátis)
   - Dashboard básico
   - Histórico de doses

💵 Pro (R$45/mês)
   - Análise IA de fotos
   - Export de dados
   - Sincronização cloud

💵 Premium (R$95/mês)
   - Tudo do Pro
   - HealthKit sync
   - Chat prioritário com IA
```

### Implementar checkout:
```typescript
// src/pages/Billing.tsx
- Mostrar planos
- Botão "Upgrade"
- Stripe Checkout modal
- Sucesso → Salvar no backend
```

### Entregáveis da Semana 9-10:
✅ Planos criados no Stripe  
✅ Checkout funcionando  
✅ Webhook de pagamento  
✅ Acesso a features pagas ativado  
✅ Email de confirmação enviado  

---

## 🎬 SEMANA 11-12 - MARKETING & LAUNCH

### Objetivo: Lançar campanha com irmã

### Irmã: Criar conteúdo
- [ ] 10 vídeos de 15-30s
- [ ] Stories no Instagram
- [ ] Testemunial genuíno (30kg perdidos em 1 ano!)
- [ ] Mostrando o app sendo usado
- [ ] **Sem mencionar:** peso, emagrecer, GLP-1, medicação
- [ ] **Mencionar:** rastreamento, hábitos, saúde, rotina

### Você: Setup de ads
```bash
# Meta Ads (Facebook/Instagram)
1. Criar Meta Business Account
2. Conectar pixel do site
3. Criar campanha com orçamento R$1000-2000
4. Audiences: Cold (toda mulher 25-50) + Warm (retargeting)
5. Ad creative: Vídeos da irmã (compliance-safe!)

# Google Ads (Search + YouTube)
1. Criar Google Ads account
2. Keywords: "app rastreamento saúde", "acompanhamento hábitos"
3. Budget: R$500-1000
4. Menos rigoroso que Meta (melhor para começar)
```

### Monitorar KPIs:
```
📊 CAC (Customer Acquisition Cost) < R$20
📊 Conversion rate (visitor → signup) > 5%
📊 Trial to paid > 5%
📊 Churn rate < 20% (perdemos usuários?)
```

### Entregáveis da Semana 11-12:
✅ 10+ vídeos criados  
✅ Campanha Meta rodando  
✅ Campanha Google rodando  
✅ Landing page convertendo  
✅ +1000 impressões  
✅ >100 signups  

---

## ⌚ SEMANA 13 - APPLE HEALTHKIT (BÔNUS)

### Objetivo: Integração com Apple Health

```bash
npm install @react-oauth/google  # Para sign-in
# Ou usar Supabase Auth built-in
```

### Implementar:
```typescript
// src/integrations/healthkit.ts
- Pedir permissão para HealthKit
- Ler: peso, passos, workouts, frequência cardíaca
- Sincronizar com backend
```

### Benefício:
- ✅ Diferencial competitivo
- ✅ Usuário não precisa digitar peso (automático)
- ✅ Integração com Apple Watch
- ✅ Muito procurado por power users

### Entregáveis da Semana 13:
✅ HealthKit sync funcionando  
✅ Dados importados automaticamente  
✅ Apple Health badge compartilhável  

---

## 📊 MÉTRICAS DE SUCESSO

### Fim da Semana 12:
- ✅ 100+ usuários (free)
- ✅ 5-10 usuários pagando (trial → paid)
- ✅ CAC < R$20
- ✅ 0 crashes em produção
- ✅ 0 complaints sobre segurança

### Ao atingir isso:
→ Aumentar ads 2x  
→ Contratar dev freelancer  
→ Escalar para 500+ usuários/mês  

---

## 🎯 AÇÃO IMEDIATA (PRÓXIMAS 2 HORAS)

1. **Testar localmente**
   ```bash
   npm install
   npm run dev
   # Verificar que disclaimer aparece
   ```

2. **Revisar commits**
   ```bash
   git log --oneline -5
   ```

3. **Ler LEGAL_DISCLAIMERS.md**
   - Entender o que está documentado
   - Preparar irmã para os termos

4. **Próximo passo: Deploy em staging**
   ```bash
   # Se tiver Vercel connectado:
   git push origin main
   # Deve fazer deploy automaticamente
   ```

---

## 💡 DICAS IMPORTANTES

### ⚠️ Para irmã (marketing-safe):
- ✅ "Acompanhei minha rotina com o app"
- ✅ "Registrei meus hábitos"
- ❌ "Emagreci com esse app"
- ❌ "App para medicação GLP-1"
- ❌ "Perdi 30kg com isso"

### ⚠️ Para código:
- Sempre validar inputs com Zod
- Sempre fazer logging de erros
- Sempre tratar exceções
- Nunca deixar token/chave em code

### ⚠️ Para banco de dados:
- Backup semanal
- Never log sensitive data
- Encrypt passwords (Supabase já faz)
- HTTPS em tudo

---

## 📞 PRECISA DE AJUDA?

Qualquer dúvida nas próximas semanas:
1. Verificar `SECURITY_IMPROVEMENTS_SUMMARY.md`
2. Verificar `LEGAL_DISCLAIMERS.md`
3. Verificar comentários no código (`// ⚠️`)
4. Abrir issue no GitHub

---

**Você está NO CAMINHO CERTO** 🚀

A semana mais crítica passa (segurança), agora é crescimento!

Boa sorte! 🎯
