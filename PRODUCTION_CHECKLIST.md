# ✅ Production Checklist - MoujApp

**Data de Launch:** [PREENCHER]  
**Responsável:** [PREENCHER]  
**Status:** [PREENCHER]

---

## 🔐 SEGURANÇA

- [ ] Variáveis de ambiente não exposto em repo
  - [ ] Nenhum `.env.local` no git
  - [ ] Nenhuma chave privada commitada
  - [ ] Verificar git history: `git log -p --follow` (chaves privadas)

- [ ] Supabase
  - [ ] Row Level Security habilitado em todas tabelas
  - [ ] Políticas RLS implementadas
  - [ ] Backups automáticos ligados
  - [ ] HTTPS obrigatório

- [ ] Backend
  - [ ] Variáveis secrets em GitHub Secrets
  - [ ] Variáveis secrets em Railway env vars
  - [ ] CORS restringido aos domínios corretos
  - [ ] Rate limiting ativado
  - [ ] Error messages não expõem detalhes
  - [ ] Logs não contêm dados sensíveis

- [ ] Frontend
  - [ ] Nenhuma chave API exposta no código
  - [ ] VITE_API_URL apontando para backend de produção
  - [ ] Content Security Policy headers
  - [ ] HTTPS obrigatório

- [ ] Deploy
  - [ ] Certificado SSL válido
  - [ ] Firewall configurado
  - [ ] DDoS protection (Cloudflare)
  - [ ] WAF rules

---

## 🏗️ ARQUITETURA

- [ ] Frontend (Vercel)
  - [ ] Build completa com sucesso
  - [ ] Sem warnings em build
  - [ ] Assets minificados
  - [ ] Source maps removidos (opcional para privacidade)

- [ ] Backend (Railway)
  - [ ] Build completa com sucesso
  - [ ] TypeScript compila sem erros
  - [ ] Dockerfile testado localmente
  - [ ] Health check endpoint respondendo

- [ ] Database (Supabase)
  - [ ] Todas migrations executadas
  - [ ] Índices criados
  - [ ] Constraints validados
  - [ ] Seeds de teste removidos

- [ ] CI/CD (GitHub Actions)
  - [ ] Todos testes passando
  - [ ] Coverage > 70%
  - [ ] Lint sem errors
  - [ ] E2E tests passando

---

## 📊 PERFORMANCE

- [ ] Frontend
  - [ ] Lighthouse score > 80
  - [ ] First Contentful Paint < 2s
  - [ ] Core Web Vitals OK
  - [ ] Bundle size otimizado
  - [ ] Lazy loading implementado

- [ ] Backend
  - [ ] Response time < 200ms (P95)
  - [ ] Database queries otimizadas
  - [ ] Índices nos campos usados em WHERE
  - [ ] Connection pooling configurado
  - [ ] Memory leak tests

- [ ] Database
  - [ ] Query performance monitorada
  - [ ] Slow query log revisado
  - [ ] Vacuum automático (PostgreSQL)
  - [ ] Cache strategy implementada

---

## 🧪 TESTES

- [ ] Unit Tests
  - [ ] 70%+ cobertura
  - [ ] Todos passando
  - [ ] Sem warnings

- [ ] Integration Tests
  - [ ] APIs testadas end-to-end
  - [ ] Database operations testadas
  - [ ] Auth flow testado

- [ ] E2E Tests
  - [ ] Onboarding flow testado
  - [ ] Login/logout testado
  - [ ] Dose adding testado
  - [ ] Sincronização testada

- [ ] Performance Tests
  - [ ] Load testing completado
  - [ ] 100+ usuários simultâneos
  - [ ] Sem timeouts ou crashes

- [ ] Security Tests
  - [ ] SQL injection testado
  - [ ] XSS testado
  - [ ] CSRF testado
  - [ ] RLS validado

---

## 📱 COMPATIBILIDADE

- [ ] Browsers
  - [ ] Chrome latest
  - [ ] Firefox latest
  - [ ] Safari latest
  - [ ] Edge latest

- [ ] Dispositivos
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (1024x768)
  - [ ] Mobile (375x667 - iPhone)
  - [ ] Mobile (414x896 - iPhone Plus)

- [ ] Sistema Operacional
  - [ ] Windows 10+
  - [ ] macOS 10.15+
  - [ ] Linux (Ubuntu 20+)
  - [ ] iOS 14+
  - [ ] Android 10+

- [ ] Funcionalidades
  - [ ] Offline mode testado
  - [ ] Sync testado
  - [ ] Notificações funcionam
  - [ ] IndexedDB funciona

---

## 🚀 DEPLOYMENT

- [ ] Pre-deployment
  - [ ] Backup database completado
  - [ ] Rollback plan documentado
  - [ ] Communication plan pronto
  - [ ] Stakeholders notificados

- [ ] During Deployment
  - [ ] Infraestrutura pronta
  - [ ] Health checks passando
  - [ ] Logs sendo monitorados
  - [ ] Team ready para troubleshooting

- [ ] Post-deployment
  - [ ] Smoke tests completados
  - [ ] Core features verificadas
  - [ ] Users podem registrar
  - [ ] Dados sincronizando
  - [ ] Monitoring ativado

---

## 📈 OBSERVABILIDADE

- [ ] Logging
  - [ ] Todos erros logados
  - [ ] Request logging estruturado
  - [ ] Logs acessíveis
  - [ ] Log retention policy (90 dias?)

- [ ] Metrics
  - [ ] CPU usage monitorado
  - [ ] Memory usage monitorado
  - [ ] Disk space monitorado
  - [ ] Network traffic monitorado

- [ ] Alertas
  - [ ] Error rate > 5% → alert
  - [ ] Response time > 1s → alert
  - [ ] Database down → alert
  - [ ] Deploy failed → alert
  - [ ] Out of memory → alert

- [ ] Dashboards
  - [ ] Vercel dashboard acessível
  - [ ] Railway dashboard acessível
  - [ ] Supabase dashboard acessível
  - [ ] Custom dashboard criado (opcional)

---

## 📞 SUPORTE & DOCUMENTAÇÃO

- [ ] Documentação
  - [ ] README.md completo
  - [ ] DEPLOY_GUIDE.md atualizado
  - [ ] API documentation completa
  - [ ] Troubleshooting guide
  - [ ] Architecture diagram

- [ ] Suporte
  - [ ] Email de suporte configurado
  - [ ] Discord/Slack para comunidade
  - [ ] Response time SLA definido
  - [ ] Incident response plan

- [ ] Runbooks
  - [ ] Como fazer deploy
  - [ ] Como reverter deploy
  - [ ] Como escalar recursos
  - [ ] Como limpar cache

---

## 💰 CUSTOS & BILLING

- [ ] Vercel
  - [ ] Pro plan se necessário
  - [ ] Billing ativo
  - [ ] Invoice notifications

- [ ] Railway
  - [ ] Pro plan se necessário
  - [ ] Billing ativo
  - [ ] Invoice notifications

- [ ] Supabase
  - [ ] Pro plan (recomendado)
  - [ ] Backup plan
  - [ ] Billing ativo
  - [ ] Invoice notifications

- [ ] Terceiros (Sentry, Datadog, etc)
  - [ ] Contas criadas
  - [ ] Billing configurado
  - [ ] Alerts ativados

---

## 👥 ACESSO

- [ ] GitHub
  - [ ] Todos os devs tem acesso ao repo
  - [ ] Protected branches (main requer review)
  - [ ] Deploy keys configuradas

- [ ] Vercel
  - [ ] Todos têm acesso ao dashboard
  - [ ] Permissions adequadas

- [ ] Railway
  - [ ] Todos têm acesso ao dashboard
  - [ ] Permissions adequadas

- [ ] Supabase
  - [ ] Todos têm acesso ao dashboard
  - [ ] Projeto backup/recovery plan

---

## 📋 COMPLIANCE

- [ ] LGPD (Brasil)
  - [ ] Privacy policy publicada
  - [ ] Terms of service publicados
  - [ ] GDPR compliant (EU users)
  - [ ] Data deletion implemented

- [ ] Médico
  - [ ] Disclaimers visíveis
  - [ ] Emergency numbers disponíveis
  - [ ] Medical non-responsibility clara
  - [ ] Notificação de riscos

- [ ] Acessibilidade
  - [ ] WCAG 2.1 Level AA
  - [ ] Screen reader compatible
  - [ ] Keyboard navigation
  - [ ] Color contrast OK

---

## 🎯 BUSINESS

- [ ] Monetização
  - [ ] Stripe account criada
  - [ ] Payment flow testado
  - [ ] Subscription plans definidos
  - [ ] Invoicing funcionando

- [ ] Analytics
  - [ ] Google Analytics configurado
  - [ ] Eventos rastreados
  - [ ] Conversion tracking
  - [ ] Attribution configured

- [ ] Marketing
  - [ ] Landing page pronta
  - [ ] Social media links
  - [ ] Email list setup
  - [ ] Announcement pronto

---

## ✅ SIGN OFF

- [ ] Dev lead: _________________
- [ ] QA lead: _________________
- [ ] DevOps lead: _________________
- [ ] Product owner: _________________

**Launch date:** _________________

---

## 📝 NOTES

```
[Adicionar notas importantes aqui]
```

---

## 🎉 LAUNCH!

Após todos checkboxes marcados:

```bash
# Final deploy
git tag -a v1.0.0 -m "Production Release"
git push origin v1.0.0

# Notify stakeholders
# Update status page
# Send announcement
```

**Status:** ✅ Pronto para produção!
