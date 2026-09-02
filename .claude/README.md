# .claude — Convenções portáveis

Esta pasta guarda **como eu gosto de escrever código** (estrutura de pastas, estilo,
arquitetura, testes e ferramentas), extraída do projeto `05-nest`
(NestJS + Clean Architecture + DDD + Prisma + Vitest).

## Como levar para outro projeto

1. Copie a pasta `.claude/` inteira para a raiz do novo projeto.
2. Copie o `CLAUDE.md` da raiz (ele só faz os `@imports` dos arquivos daqui).
3. Ajuste em `conventions/00-visao-geral.md` o nome do projeto e os contextos de domínio.
4. Se o novo projeto não for NestJS, mantenha `01`, `02`, `03`, `05` e descarte/adapte o `04`.

## Índice

| Arquivo | Conteúdo |
| --- | --- |
| `conventions/00-visao-geral.md` | Stack, princípios, regras de dependência |
| `conventions/01-estrutura-pastas.md` | Árvore de diretórios e onde cada coisa mora |
| `conventions/02-estilo-codigo.md` | Nomenclatura, formatação, imports, jeito de escrever |
| `conventions/03-dominio.md` | Entity, AggregateRoot, Value Object, Either, use case, repositório |
| `conventions/04-infra-nest.md` | Módulos, controllers, Zod pipe, auth JWT, Prisma, env |
| `conventions/05-testes.md` | Unitários com in-memory + E2E com schema isolado |
| `conventions/06-ferramentas.md` | package.json, tsconfig, eslint, prettier, vitest, docker |
| `conventions/07-checklists.md` | Passo a passo para criar use case / rota / entidade |
| `conventions/08-desvios.md` | Inconsistências que existem hoje e NÃO devem ser copiadas |
| `templates/domain.md` | Templates: entidade, use case, repositório |
| `templates/tests.md` | Templates: spec unitário, in-memory repo, factory, e2e-spec |
| `templates/http.md` | Templates: controller Nest + módulo |
