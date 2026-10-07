# CRM Iniciais

CRM para gestão de iniciais do escritório. Front e back são aplicações separadas.

```
crm/
  backend/    API NestJS  — Clean Architecture + DDD + Prisma + Vitest
  frontend/   SPA React   — Vite + React Router + TanStack Query + Tailwind
  .claude/    convenções de código do projeto
```

## Backend (`backend/`)

### Pré-requisitos

Postgres local via Docker (porta **5433** no host):

```bash
cd backend
docker compose up -d
```

### Chaves do JWT (RS256)

```bash
openssl genrsa -out private_key.pem 2048
openssl rsa -in private_key.pem -pubout -out public_key.pem

base64 -i private_key.pem | pbcopy   # cole em JWT_PRIVATE_KEY
base64 -i public_key.pem  | pbcopy   # cole em JWT_PUBLIC_KEY
```

Os `*.pem` estão no `.gitignore` — as chaves nunca vão para o repositório.

### Subindo

```bash
cd backend
cp .env.example .env          # e preencha as chaves
npm install
npx prisma migrate dev        # cria as tabelas e gera o client
npm run start:dev             # http://localhost:3333
```

### Testes

```bash
npm test         # unitários (casos de uso, com repositórios in-memory)
npm run test:e2e # E2E (cada arquivo roda em um schema Postgres isolado)
npm run lint
```

### Rotas já implementadas

| Verbo | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/accounts` | Cria a conta de acesso |
| `POST` | `/sessions` | Autentica e devolve `access_token` |
| `GET` | `/me` | Perfil do usuário autenticado |

`client.http` na raiz do backend tem as três chamadas prontas para o REST Client.

## Frontend (`frontend/`)

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3333
npm install
npm run dev                   # http://localhost:5173
```

Telas já implementadas: `/sign-in`, `/sign-up` e o painel autenticado em `/`.
O token fica no `localStorage` e é injetado pelo interceptor do axios (`src/lib/api.ts`).

## Como crescer o projeto

Um módulo novo do CRM entra sempre pelo domínio, nunca pelo controller:

1. Entidade em `backend/src/domain/<contexto>/enterprise/entities/`.
2. Interface do repositório em `application/repositories/`.
3. Caso de uso + spec em `application/use-cases/`.
4. Repositório in-memory em `backend/test/repositories/` e factory em `backend/test/factories/`.
5. Modelo no `prisma/schema.prisma` + `PrismaXMapper` + `PrismaXRepository`, registrados no `PrismaModule`.
6. Controller em `infra/http/controllers/` (um por caso de uso) + e2e ao lado, registrado no `HttpModule`.
7. No front: página em `src/pages/`, rota em `src/routes/router.tsx`, chamada em `src/lib/`.

O passo a passo detalhado está em `.claude/conventions/07-checklists.md`.

## Deploy (Render + Vercel)

- **API + Postgres** no Render, descritos em `render.yaml` (Blueprint).
  O build roda `prisma generate` e o `preDeployCommand` aplica `prisma migrate deploy`.
- **Frontend** na Vercel, com *Root Directory* `frontend` e a env `VITE_API_URL`
  apontando para a URL da API. O `frontend/vercel.json` faz o fallback das rotas da SPA.

Variáveis da API no Render:

| Variável | Valor |
| --- | --- |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | base64 de um par de chaves **exclusivo de produção** |
| `CORS_ORIGIN` | URL do frontend na Vercel (várias separadas por vírgula) |
| `ALLOW_SIGN_UP` | `true` só até criar as contas; depois `false` (bloqueia `POST /accounts`) |

Não rode o `seed` em produção: ele apaga clientes e produtos antes de inserir os dados de exemplo.
