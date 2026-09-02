# Visão geral

## Stack padrão

- **NestJS 11** (Express) + TypeScript 5.7, `target: ES2023`, `module: nodenext`
- **Prisma 7** com driver adapter `@prisma/adapter-pg` (PostgreSQL)
- **Zod 4** para validação de entrada HTTP e de variáveis de ambiente
- **Passport JWT** com par de chaves **RS256** em base64
- **Vitest 4** (unitário + E2E) com `unplugin-swc` e `vite-tsconfig-paths`
- **bcryptjs** para hash de senha, **dayjs** para datas, **@faker-js/faker** nos testes
- **Docker Compose** só para o Postgres local

## Arquitetura: Clean Architecture + DDD

Três camadas, com a regra de dependência apontando sempre para dentro:

```
infra  ──▶  domain/application  ──▶  domain/enterprise  ──▶  core
```

- **`core/`** — blocos genéricos, sem regra de negócio: `Entity`, `AggregateRoot`,
  `UniqueEntityID`, `Either`, eventos de domínio, `PaginationParams`, erros base.
- **`domain/<contexto>/enterprise/`** — entidades, value objects e eventos de domínio.
  **Regras de negócio da empresa.** Não conhece banco, HTTP nem framework.
- **`domain/<contexto>/application/`** — casos de uso, **interfaces** de repositório
  e subscribers de eventos. **Regras da aplicação.**
- **`infra/`** — NestJS, Prisma, HTTP, auth, env. É a única camada que conhece framework.

### Invioláveis

1. `core/` e `domain/` **não importam nada do NestJS, do Prisma ou do Express.**
2. Casos de uso dependem de **interfaces** de repositório, nunca de implementações.
3. Toda operação com banco passa por um repositório.
4. Um contexto de domínio nunca importa entidades de outro contexto — apenas
   `application/repositories` e `enterprise/events` alheios, via subscriber.
5. Casos de uso **não lançam exceções para fluxo esperado** — retornam `Either`.

## Contextos de domínio (deste projeto)

- `forum` — Question, Answer, Comment, Attachment, Student, Instructor
- `notification` — Notification + subscribers que reagem a eventos do `forum`
