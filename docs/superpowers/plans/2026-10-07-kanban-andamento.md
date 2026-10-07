# Kanban de andamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a tela inicial por um kanban de 3 etapas (Comercial → Protocolo → Concluído), com link do Drive, observação, responsável e "movido por/quando" em cada card.

**Architecture:** Campo novo `etapa` no `Cliente` (contexto `triagem`), independente da `coluna` da triagem n8n. Dois casos de uso novos no `triagem` (`MoverEtapaCliente`, `EditarCliente`) e um no `account` (`FetchUsuarios`). Front: página `andamento.tsx` vira a rota `/`; as telas da triagem saem do router/menu, mas os arquivos ficam.

**Tech Stack:** NestJS 11, Prisma 7, Zod 4, Vitest 4; React 19, TanStack Query 5, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-10-07-kanban-andamento-design.md`

## Global Constraints

- Etapas: `COMERCIAL`, `PROTOCOLO`, `CONCLUIDO`; default `COMERCIAL`.
- `observacao` ≤ 280 caracteres; `driveUrl` precisa ser URL; `null` limpa o campo, `undefined` não mexe.
- Quem moveu vem de `@CurrentUser()`, nunca do corpo.
- Mover para a mesma etapa é no-op de sucesso (não altera `movidoEm`).
- Clientes: `refetchInterval: 30_000` e `refetchOnWindowFocus: true`.
- Convenções do `CLAUDE.md`/`.claude/conventions` (Either, `sut`, `should be able to`/`should not be able to`, E2E com `(E2E)` e `[VERBO] /rota`).

## Review Focus

1. Limpar um campo (mandar `null`) precisa persistir no Postgres — o mapper deve enviar `null`, não `undefined` (Prisma ignora `undefined` em `update`). Pinado no E2E da Task 4.
2. Responsável inexistente → 404, não 500 por FK. Pinado em unit (Task 2) e E2E (Task 4).
3. Usuário que moveu/era responsável é excluído → `onDelete: SetNull`, cliente continua. Pinado no schema (Task 1).
4. Arrastar para a mesma coluna não deve reescrever "movido por". Pinado em unit (Task 2).
5. Falha no PATCH de etapa → card volta para a coluna original (rollback otimista) e toast. Verificado manualmente no browser (Task 6).

---

### Task 1: Schema, entidade, mapper e presenter

**Files:**
- Modify: `backend/prisma/schema.prisma` (enum `EtapaCliente`, campos e relações em `Cliente` e `User`)
- Create: migration `kanban_andamento` (via `prisma migrate dev`)
- Modify: `backend/src/domain/triagem/enterprise/entities/cliente.ts`
- Modify: `backend/src/infra/prisma/mappers/prisma-cliente-mapper.ts`
- Modify: `backend/src/infra/http/presenters/cliente-presenter.ts`

**Interfaces — Produces:**
- `export type EtapaCliente = 'COMERCIAL' | 'PROTOCOLO' | 'CONCLUIDO'`
- `ClienteProps` + `etapa: EtapaCliente; driveUrl?: string; observacao?: string; responsavelId?: UniqueEntityID; movidoPorId?: UniqueEntityID; movidoEm?: Date`
- `cliente.moverParaEtapa(etapa: EtapaCliente, movidoPorId: UniqueEntityID): void` (no-op se igual)
- setters `driveUrl`, `observacao`, `responsavelId` (aceitam `undefined` para limpar)

- [ ] **Step 1:** Schema:

```prisma
enum EtapaCliente {
  COMERCIAL
  PROTOCOLO
  CONCLUIDO

  @@map("etapa_cliente")
}

// model User — adicionar:
  clientesResponsavel Cliente[] @relation("ClienteResponsavel")
  clientesMovidos     Cliente[] @relation("ClienteMovidoPor")

// model Cliente — adicionar:
  etapa         EtapaCliente @default(COMERCIAL)
  driveUrl      String?      @map("drive_url")
  observacao    String?
  responsavelId String?      @map("responsavel_id")
  movidoPorId   String?      @map("movido_por_id")
  movidoEm      DateTime?    @map("movido_em")

  responsavel User? @relation("ClienteResponsavel", fields: [responsavelId], references: [id], onDelete: SetNull)
  movidoPor   User? @relation("ClienteMovidoPor", fields: [movidoPorId], references: [id], onDelete: SetNull)
```

Run: `npx prisma migrate dev --name kanban_andamento` → migration criada, client regenerado.

- [ ] **Step 2:** Entidade — getters na ordem da interface, setters com `touch()`, e:

```ts
moverParaEtapa(etapa: EtapaCliente, movidoPorId: UniqueEntityID) {
  if (this.props.etapa === etapa) {
    return;
  }

  this.props.etapa = etapa;
  this.props.movidoPorId = movidoPorId;
  this.props.movidoEm = new Date();
  this.touch();
}
```

`create`: `'etapa'` no `Optional`, `etapa: props.etapa ?? 'COMERCIAL'`.

- [ ] **Step 3:** Mapper — em `toScalars`, campos novos com `?? null` (`responsavelId: cliente.responsavelId?.toString() ?? null`, idem `movidoPorId`, `driveUrl`, `observacao`, `movidoEm`); em `toDomain`, `?? undefined` e `new UniqueEntityID(...)` para os IDs.

- [ ] **Step 4:** Presenter — adicionar `etapa`, `driveUrl ?? null`, `observacao ?? null`, `responsavelId?.toString() ?? null`, `movidoPorId?.toString() ?? null`, `movidoEm ?? null`.

- [ ] **Step 5:** `npx tsc --noEmit -p tsconfig.json` e `npm test` → tudo verde. Commit `feat: etapa de andamento no cliente`.

### Task 2: Casos de uso MoverEtapaCliente e EditarCliente (TDD)

**Files:**
- Create: `backend/src/domain/triagem/application/use-cases/mover-etapa-cliente.ts` + `.spec.ts`
- Create: `backend/src/domain/triagem/application/use-cases/editar-cliente.ts` + `.spec.ts`

**Interfaces — Produces:**
- `new MoverEtapaClienteUseCase(clientesRepository)` · `execute({ clienteId, etapa, usuarioId }) → Either<ResourceNotFoundError, { cliente }>`
- `new EditarClienteUseCase(clientesRepository, usersRepository)` · `execute({ clienteId, driveUrl?, observacao?, responsavelId? }: string | null | undefined) → Either<ResourceNotFoundError, { cliente }>`

- [ ] **Step 1: testes falhando** — `mover-etapa-cliente.spec.ts`:

```ts
it('should be able to move a cliente to another etapa', async () => {
  const cliente = makeCliente({}, new UniqueEntityID('cliente-1'));
  inMemoryClientesRepository.items.push(cliente);

  const result = await sut.execute({ clienteId: 'cliente-1', etapa: 'PROTOCOLO', usuarioId: 'user-1' });

  expect(result.isRight()).toBe(true);
  expect(inMemoryClientesRepository.items[0].etapa).toBe('PROTOCOLO');
  expect(inMemoryClientesRepository.items[0].movidoPorId?.toString()).toBe('user-1');
  expect(inMemoryClientesRepository.items[0].movidoEm).toBeInstanceOf(Date);
});

it('should not change who moved when the etapa is the same', async () => { /* movidoPorId 'user-0', etapa PROTOCOLO; execute PROTOCOLO por 'user-1' → continua 'user-0' */ });

it('should not be able to move a cliente that does not exist', async () => {
  const result = await sut.execute({ clienteId: 'inexistente', etapa: 'PROTOCOLO', usuarioId: 'user-1' });

  expect(result.isLeft()).toBe(true);
  expect(result.value).toBeInstanceOf(ResourceNotFoundError);
});
```

`editar-cliente.spec.ts`: edita os três campos; `null` limpa `observacao`; `undefined` mantém `driveUrl`; cliente inexistente → `ResourceNotFoundError`; responsável inexistente → `ResourceNotFoundError`.

- [ ] **Step 2:** `npx vitest run mover-etapa editar-cliente` → FAIL (módulo não existe).

- [ ] **Step 3: implementação** — `EditarClienteUseCase.execute`:

```ts
const cliente = await this.clientesRepository.findById(clienteId);

if (!cliente) {
  return left(new ResourceNotFoundError());
}

if (responsavelId) {
  const responsavel = await this.usersRepository.findById(responsavelId);

  if (!responsavel) {
    return left(new ResourceNotFoundError());
  }
}

if (driveUrl !== undefined) cliente.driveUrl = driveUrl ?? undefined;
if (observacao !== undefined) cliente.observacao = observacao ?? undefined;
if (responsavelId !== undefined) cliente.responsavelId = responsavelId ? new UniqueEntityID(responsavelId) : undefined;

await this.clientesRepository.save(cliente);

return right({ cliente });
```

(escrito com early-return/blocos, sem `if` de uma linha, no código real.)

- [ ] **Step 4:** testes → PASS. Commit `feat: casos de uso de mover etapa e editar cliente`.

### Task 3: FetchUsuarios (TDD)

**Files:**
- Modify: `backend/src/domain/account/application/repositories/users-repository.ts` (+ `abstract findMany(): Promise<User[]>` antes de `save`)
- Modify: `backend/test/repositories/in-memory-users-repository.ts` (ordena por nome)
- Modify: `backend/src/infra/prisma/repositories/prisma-users-repository.ts` (`orderBy: { name: 'asc' }`)
- Create: `backend/src/domain/account/application/use-cases/fetch-usuarios.ts` + `.spec.ts`

**Produces:** `new FetchUsuariosUseCase(usersRepository)` · `execute() → Either<null, { users: User[] }>`

- [ ] Spec: `should be able to fetch users ordered by name` (Carla, Ana → Ana, Carla) e `should be able to fetch an empty list` (não há caminho de erro: o caso não falha — `Either<null, …>`; o segundo teste cobre o vazio).
- [ ] Rodar → FAIL; implementar; rodar → PASS. Commit `feat: listar usuarios do escritorio`.

### Task 4: Controllers HTTP + E2E

**Files:**
- Create: `backend/src/infra/http/controllers/mover-etapa-cliente.controller.ts` + `.e2e-spec.ts`
- Create: `backend/src/infra/http/controllers/editar-cliente.controller.ts` + `.e2e-spec.ts`
- Create: `backend/src/infra/http/controllers/fetch-usuarios.controller.ts` + `.e2e-spec.ts`
- Modify: `backend/src/infra/http/http.module.ts`, `backend/client.http`

Schemas:

```ts
const moverEtapaBodySchema = z.object({ etapa: z.enum(['COMERCIAL', 'PROTOCOLO', 'CONCLUIDO']) });

const editarClienteBodySchema = z.object({
  driveUrl: z.string().url().nullable().optional(),
  observacao: z.string().trim().max(280).nullable().optional(),
  responsavelId: z.string().uuid().nullable().optional(),
});
```

- `PATCH /clientes/:clienteId/etapa` — `@CurrentUser() user` → `usuarioId: user.sub`; Left → `NotFoundException`.
- `PATCH /clientes/:clienteId` — Left → `NotFoundException`.
- `GET /usuarios` — `{ usuarios: users.map(UserPresenter.toHTTP) }`.

E2E (cada um: status **e** banco):
- `[PATCH] /clientes/:clienteId/etapa - should move a cliente and record who moved it` → `etapa`, `movidoPorId === user.id`, `movidoEm` não nulo.
- `[PATCH] /clientes/:clienteId - should edit drive link, note and responsavel`
- `[PATCH] /clientes/:clienteId - should clear a field when null is sent` (Review Focus 1)
- `[PATCH] /clientes/:clienteId - should return 404 for an unknown responsavel` (Review Focus 2)
- `[GET] /usuarios - should list the office users`

- [ ] Escrever E2E → `npm run test:e2e` FAIL (404 de rota); implementar e registrar no módulo → PASS. Commit `feat: rotas de etapa, edicao de cliente e usuarios`.

### Task 5: Frontend — dados

**Files:**
- Modify: `frontend/src/types/triagem.ts` (`EtapaCliente`, campos no `Cliente`, `Usuario`, `EdicaoDeCliente`)
- Modify: `frontend/src/lib/query-keys.ts` (`usuarios`)
- Modify: `frontend/src/hooks/use-clientes.ts` (polling 30s + foco)
- Create: `frontend/src/hooks/use-usuarios.ts`
- Create: `frontend/src/lib/andamento.ts` + `andamento.spec.ts`
- Modify: `frontend/src/contexts/triagem-context.ts`, `triagem-provider.tsx` (`moverEtapa`, `editarCliente`, `usuarios`, `usuarioDe`)

`lib/andamento.ts` produz:
- `etapasDoKanban: { key: EtapaCliente; label: string; descricao: string; color: string }[]`
- `tempoRelativo(iso: string, agora = new Date()): string` → `'agora'`, `'há 5 min'`, `'há 3 h'`, `'ontem'`, `'há 4 dias'`, `'em 12/03/2026'` (> 30 dias)

- [ ] Spec de `tempoRelativo` com cada faixa → FAIL → implementar → PASS (`npm test` no front).
- [ ] `moverEtapa` com update otimista + rollback + toast; `editarCliente(id, dados, aoConcluir)` invalida clientes e mostra toast. Commit `feat: dados do kanban de andamento no front`.

### Task 6: Frontend — tela

**Files:**
- Create: `frontend/src/pages/andamento.tsx` (3 colunas, drag-and-drop)
- Create: `frontend/src/components/crm/andamento-card.tsx`
- Create: `frontend/src/components/crm/editar-cliente-painel.tsx` (painel lateral)
- Modify: `frontend/src/routes/router.tsx` (`/` → `Andamento`; remove `/kanban`, `/painel`)
- Modify: `frontend/src/components/crm/sidebar.tsx` (menu: só "Andamento" com contador)
- Modify: `frontend/src/lib/navegacao.ts` (título "Andamento")
- Modify: `frontend/src/components/crm/topbar.tsx` (remove o caso `/kanban`)
- Modify: `frontend/src/contexts/triagem-provider.tsx` (`selecionar` não navega mais; toast de criação sem "n8n")

- [ ] Implementar; `npm run lint` e `npm run build` no front → verdes.
- [ ] Browser (portal Maestri): arrastar card Comercial → Protocolo, recarregar e ver que persiste com "movido por"; editar link/observação/responsável; abrir Drive; buscar por nome; simular falha (API parada) e ver rollback. Commit `feat: kanban de andamento como tela inicial`.

### Task 7: Fechamento

- [ ] `npm run lint`, `npm test`, `npm run test:e2e` no backend; `npm run lint`, `npm test`, `npm run build` no front.
- [ ] Merge com `main` (outra sessão mexeu em `router.tsx`, `sidebar.tsx`, `navegacao.ts`, `http.module.ts`) resolvendo conflitos mantendo as duas features.
