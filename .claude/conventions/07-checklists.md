# Checklists

## Novo caso de uso

1. `src/domain/<contexto>/application/use-cases/<verbo>-<substantivo>.ts`
   — `Request` (primitivos), `Response` (`Either`), classe `...UseCase` com `execute`.
2. Se precisar de um método novo no repositório, adicione **primeiro na interface**
   `application/repositories/<plural>-repository.ts`.
3. Implemente o método no `test/repositories/in-memory-<plural>-repository.ts`.
4. `<verbo>-<substantivo>.spec.ts` ao lado, com no mínimo:
   um `should be able to ...` e um `should not be able to ...`.
5. `npm test`.

## Nova entidade

1. `enterprise/entities/<entidade>.ts` — `export interface <Nome>Props`, getters,
   `touch()`, setters, `static create(props: Optional<Props, 'createdAt' | ...>, id?)`.
2. Se for raiz de agregado que emite evento → estenda `AggregateRoot` e emita no `create` com `!id`.
3. `test/factories/make-<entidade>.ts`.
4. Modelo no `prisma/schema.prisma` com `@@map` plural e `@map` snake_case.
5. `npx prisma migrate dev --name <descricao>`.

## Nova rota HTTP

1. `src/infra/http/controllers/<acao>.controller.ts` — schema Zod no topo, classe com `handle`.
2. Registrar em `HttpModule.controllers`.
3. Rota autenticada → `@UseGuards(AuthGuard('jwt'))` + `@CurrentUser()`.
4. `<acao>.controller.e2e-spec.ts` ao lado, `describe('... (E2E)')` + `test('[VERBO] /rota - ...')`.
5. Adicionar a chamada no `client.http`.
6. `npm run test:e2e`.

## Novo evento de domínio

1. `enterprise/events/<coisa>-<passado>-event.ts` implementando `DomainEvent`.
2. Emitir com `this.addDomainEvent(...)` no `create` ou no setter da entidade.
3. Subscriber em `application/subscribers/on-<evento>.ts`, `implements EventHandler`,
   registrando em `setupSubscriptions()` com `.bind(this)`.
4. Garantir que o repositório in-memory chama `DomainEvents.dispatchEventsForAggregate`.
5. Spec do subscriber usando `waitFor(...)`.

## Antes de encerrar qualquer tarefa

```bash
npm run lint
npm test
npm run test:e2e   # se mexeu em infra/http, auth ou prisma
```
