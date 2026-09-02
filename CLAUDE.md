# CLAUDE.md

Instruções do projeto **CRM Iniciais**. As convenções vivem em `.claude/` para poderem ser
copiadas inteiras para outros projetos.

## Estrutura do repositório

- `backend/` — API em NestJS (Clean Architecture + DDD + Prisma + Vitest).
- `frontend/` — SPA em React (Vite + React Router + TanStack Query + Tailwind).

O front e o back são aplicações independentes: cada uma tem o seu `package.json`,
o seu lint e o seu ciclo de build. A conversa entre elas é só HTTP/JSON.

## Idioma

- Converse comigo **sempre em Português do Brasil**.
- **Código, identificadores, nomes de arquivo e mensagens de erro em inglês.**
- Descrições de teste (`describe`/`it`) em inglês; dados fake dentro do teste podem ser em português.
- Textos de interface no `frontend/` em português.
- Commits em português, no padrão Conventional Commits (`feat:`, `refactor:`, `fix:`).

## Convenções

@.claude/conventions/00-visao-geral.md
@.claude/conventions/01-estrutura-pastas.md
@.claude/conventions/02-estilo-codigo.md
@.claude/conventions/03-dominio.md
@.claude/conventions/04-infra-nest.md
@.claude/conventions/05-testes.md
@.claude/conventions/06-ferramentas.md
@.claude/conventions/07-checklists.md

As convenções `01` e `04` descrevem a árvore a partir da raiz do backend — leia-as
como se a raiz fosse `backend/`.

## Regras de trabalho

- Ao criar um novo caso de uso, rota ou entidade, siga o checklist de `.claude/conventions/07-checklists.md`
  e os templates de `.claude/templates/`.
- Nunca edite nada em `backend/src/generated/` — é saída do `prisma generate`.
- Não crie testes E2E sem o setup de schema isolado (`backend/test/setup-e2e.ts`).
- No `frontend/`, arquivo em `kebab-case.tsx`, componente em `PascalCase`, sem barrel files,
  alias `@/` para `src/` — mesmas regras de `02-estilo-codigo.md`.
- Antes de dar a tarefa por concluída: `npm run lint` e `npm test` no `backend/`,
  e `npm run lint` no `frontend/`.
