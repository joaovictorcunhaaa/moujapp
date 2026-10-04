# Manual de Instalacao - MoujApp

## Visao Geral

Este manual explica como instalar e executar o MoujApp no computador.

O projeto foi desenvolvido com:

- React
- TypeScript
- Vite
- Node.js

## Requisitos

Antes de instalar, verifique se voce tem:

- Node.js 18 ou superior
- npm instalado
- acesso aos arquivos do projeto

## Passo 1 - Abrir a pasta do projeto

Coloque o projeto em uma pasta no seu computador.

Exemplo:

```bash
c:\Users\SeuNome\Downloads\MoujApp
```

## Passo 2 - Abrir o terminal na pasta

Abra o terminal ou PowerShell dentro da pasta do projeto.

## Passo 3 - Instalar as dependencias

Execute o comando abaixo:

```bash
npm install
```

Esse comando instala todas as bibliotecas necessarias para o funcionamento do app.

## Passo 4 - Rodar o projeto em modo desenvolvimento

Depois da instalacao, execute:

```bash
npm run dev
```

O terminal vai mostrar um endereco local, normalmente parecido com:

```bash
http://localhost:8080/
```

ou

```bash
http://localhost:5173/
```

Abra esse endereco no navegador.

## Passo 5 - Usar o app

Quando abrir no navegador:

- o app iniciara normalmente
- o usuario sera levado para o onboarding
- os dados serao salvos localmente no navegador

## Como gerar a versao de producao

Para gerar os arquivos finais do projeto, use:

```bash
npm run build
```

Depois disso, sera criada a pasta:

```bash
dist
```

Essa pasta contem a versao pronta para publicacao.

## Como testar a versao final

Para visualizar a build final localmente, execute:

```bash
npm run preview
```

Depois abra o endereco informado no terminal.

## Estrutura basica dos comandos

Instalar dependencias:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Gerar build:

```bash
npm run build
```

Visualizar build:

```bash
npm run preview
```

## Sobre a funcao de analise por foto

O app possui uma funcao de analise de refeicao por foto.

Para essa funcao funcionar corretamente, e necessario configurar a integracao com a OpenAI.

Importante:

- nao e recomendado deixar chave de API exposta no codigo
- o ideal e usar variaveis de ambiente
- se a chave nao estiver configurada corretamente, essa funcao pode nao funcionar

## Onde os dados ficam salvos

Atualmente o app salva os dados no navegador do usuario.

Isso inclui:

- dados do onboarding
- historico de doses
- dados de estilo de vida
- historico de analises

Se o navegador for limpo, os dados podem ser apagados.

## Problemas comuns

### 1. O comando `npm install` nao funciona

Verifique:

- se o Node.js esta instalado
- se o npm esta funcionando
- se o terminal esta aberto na pasta correta do projeto

## 2. O app nao abre no navegador

Verifique:

- se o comando `npm run dev` foi executado
- se o endereco local foi aberto corretamente
- se a porta mostrada no terminal esta correta

## 3. A analise por foto nao funciona

Verifique:

- se existe conexao com a internet
- se a chave da OpenAI esta configurada corretamente
- se a conta da API possui saldo e acesso ao modelo utilizado

## 4. Os dados sumiram

Isso pode acontecer se:

- o navegador foi limpo
- o cache foi apagado
- o app foi aberto em outro navegador ou dispositivo

## Recomendacao para entrega ao comprador

Se este projeto for vendido, o ideal e entregar junto:

- codigo-fonte completo
- este manual de instalacao
- manual do usuario
- orientacao basica para publicacao

## Resumo rapido

Passos principais:

1. instalar o Node.js
2. abrir a pasta do projeto
3. executar `npm install`
4. executar `npm run dev`
5. abrir o link local no navegador

## Observacao Final

O MoujApp funciona hoje como um app web com dados salvos localmente no navegador.

Se desejar, este manual pode ser adaptado para:

- cliente final
- comprador do codigo
- equipe tecnica
- entrega comercial
