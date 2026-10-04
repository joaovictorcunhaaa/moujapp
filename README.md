# MoujApp - Acompanhamento GLP-1

**Seu companheiro inteligente para acompanhamento de tratamento com medicamentos GLP-1**

MoujApp é uma aplicação web progressiva (PWA) desenvolvida para auxiliar pacientes no acompanhamento de tratamentos com medicamentos GLP-1 como Ozempic, Mounjaro, Wegovy e similares.

## 🎯 Funcionalidades Principais

### 📋 Onboarding Personalizado
- **20 etapas** de configuração inicial completa
- Coleta de dados pessoais (idade, gênero, medidas)
- Configuração de medicamento e dosagem
- Definição de metas de peso e velocidade de perda
- Avaliação de nível de atividade física
- Identificação de motivações e efeitos colaterais

### 📊 Dashboard Inteligente
- Acompanhamento do progresso de peso em tempo real
- Cálculo automático de IMC
- Visualização do percentual de meta atingida
- Alertas para aumento de peso
- Notificação de meta alcançada

### 💉 Controle de Medicação
- Registro de doses aplicadas
- Cálculo automático da próxima dose
- Histórico completo de aplicações
- Seleção de local de aplicação
- Gráfico de evolução do tratamento

### 🏃‍♀️ Estilo de Vida
- Metas nutricionais personalizadas (calorias, proteínas, fibras)
- Controle de consumo de água
- Registro de atividades físicas
- Cálculo de calorias queimadas
- **Análise de pratos por foto** usando IA (OpenAI GPT-4o-mini)
  - Identificação automática de alimentos
  - Estimativa de calorias e macronutrientes
  - Score de saudabilidade (0-100)
  - Nível de processamento dos alimentos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler
- **React Router DOM** para navegação
- **TanStack Query** para gerenciamento de estado
- **React Hook Form** com validação Zod

### UI/UX
- **Tailwind CSS** para estilização
- **Radix UI** para componentes acessíveis
- **Lucide React** para ícones
- **Shadcn/ui** como sistema de design
- **Recharts** para gráficos e visualizações

### Funcionalidades Avançadas
- **React Spring** para animações fluidas
- **Use Gesture** para interações touch
- **Vaul** para drawers mobile
- **Sonner** para notificações toast
- **Date-fns** para manipulação de datas

### Desenvolvimento
- **ESLint** para linting
- **TypeScript** para tipagem estática
- **PostCSS** e **Autoprefixer**
- **Lovable Tagger** para desenvolvimento

## 📱 Características Mobile-First

- Interface otimizada para dispositivos móveis
- Navegação por abas na parte inferior
- Componentes touch-friendly
- Suporte a gestos e swipes
- Design responsivo

## 🧮 Cálculos e Algoritmos

### Nutricionais
- **TMB (Taxa Metabólica Basal)** usando fórmula Mifflin-St Jeor
- **TDEE (Total Daily Energy Expenditure)** baseado no nível de atividade
- **Metas calóricas** com déficit personalizado
- **Distribuição de macronutrientes** (proteínas, carboidratos, gorduras)
- **Necessidade hídrica** baseada no peso corporal

### Médicos
- **Cálculo de IMC** e categorização
- **Peso ideal** dentro da faixa saudável
- **Progressão de doses** conforme frequência
- **Análise de tendências** de peso

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── onboarding/     # Fluxo de configuração inicial
│   └── BottomNav.tsx   # Navegação principal
├── hooks/              # Hooks customizados
│   ├── useOnboarding.ts # Gerenciamento do onboarding
│   └── useDoses.tsx    # Controle de medicação
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Tela principal
│   ├── Treatment.tsx   # Acompanhamento médico
│   ├── Lifestyle.tsx   # Estilo de vida
│   └── Onboarding.tsx  # Configuração inicial
├── types/              # Definições TypeScript
├── utils/              # Utilitários e cálculos
└── lib/                # Configurações de bibliotecas
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Chave API da OpenAI (opcional, para análise de pratos por foto)

### Configuração da API OpenAI

Para utilizar a funcionalidade de **análise de pratos por foto**, você precisa configurar uma chave API da OpenAI:

1. **Obtenha uma chave API:**
   - Acesse [platform.openai.com](https://platform.openai.com)
   - Crie uma conta ou faça login
   - Vá para "API Keys" e gere uma nova chave

2. **Configure a chave como variável de ambiente:**
   - A chave nunca fica no código do frontend: as chamadas à OpenAI passam pelas Vercel Functions em `api/chat.ts` (chat com IA) e `api/analyze-meal.ts` (análise de pratos)
   - Localmente: copie `.env.example` para `.env.local` e preencha `OPENAI_API_KEY`, depois rode `vercel dev` (o `npm run dev` sozinho não executa as funções em `api/`)
   - Na Vercel: Project → Settings → Environment Variables → `OPENAI_API_KEY`, ou `vercel env add OPENAI_API_KEY`

3. **Modelo utilizado:**
   - A aplicação usa o modelo `gpt-4o-mini` para análise de imagens
   - Certifique-se de que sua conta OpenAI tem acesso a este modelo

> ⚠️ **Importante:** Nunca coloque a chave no código em `src/` nem faça commit do `.env.local` — tudo em `src/` vai para o navegador do usuário.

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Acesse http://localhost:8080
```

### Build para Produção
```bash
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

## 💾 Armazenamento Local

A aplicação utiliza localStorage para persistir:
- **Dados do onboarding** (`moujapp-onboarding`)
- **Histórico de doses** (`moujapp-doses`)
- **Dados de estilo de vida** (`moujapp-lifestyle`)

## 🎨 Temas e Personalização

- Suporte a tema claro/escuro
- Cores personalizáveis via CSS variables
- Componentes acessíveis (WCAG)
- Animações suaves e responsivas

## 📊 Métricas Acompanhadas

### Peso e Composição
- Peso atual vs. peso inicial
- Progresso em direção à meta
- Histórico de variações
- Cálculo de IMC

### Medicação
- Doses aplicadas
- Frequência de aplicação
- Locais de aplicação
- Próxima dose programada

### Estilo de Vida
- Consumo calórico
- Ingestão de água
- Atividade física
- Qualidade do sono

## 🔒 Privacidade e Segurança

### Armazenamento Local
- Todos os dados pessoais são armazenados localmente no dispositivo
- Controle total do usuário sobre seus dados
- Possibilidade de reset completo a qualquer momento

### Análise de Imagens
- **Funcionalidade opcional:** A análise de pratos por foto requer conexão com a API da OpenAI
- As imagens são enviadas temporariamente para análise e não são armazenadas nos servidores da OpenAI
- Resultados da análise são salvos apenas localmente no dispositivo
- Você pode usar o app completamente sem esta funcionalidade

### Recomendações de Segurança
- Mantenha sua chave API da OpenAI segura
- Use variáveis de ambiente em produção
- Revise regularmente as configurações de privacidade

---

**Desenvolvido com ❤️ Club do Software**