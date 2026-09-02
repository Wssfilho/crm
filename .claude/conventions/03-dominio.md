# Camada de domínio

## Entity / AggregateRoot

- `Entity<Props>` guarda `props` (protected) e `_id: UniqueEntityID` (private, exposto por getter).
- Construtor **protegido**; instanciação só via `static create()`.
- `AggregateRoot<Props>` estende `Entity` e acumula `domainEvents`.
- `UniqueEntityID` encapsula `randomUUID()`; comparações por `.equals()`, nunca `===` em string solta.

Anatomia obrigatória de uma entidade, nesta ordem:

1. `export interface <Nome>Props { ... }` — exportada, porque as factories de teste usam `Partial<Props>`.
2. `export class <Nome> extends AggregateRoot<Props>` (ou `Entity<Props>` se não emite evento).
3. **Getters** de todas as props, na mesma ordem da interface.
4. Getters derivados (`get isNew()`, `get excerpt()`).
5. `private touch() { this.props.updatedAt = new Date() }`.
6. **Setters** — cada um chama `this.touch()` no fim; setter que dispara evento de domínio
   compara o valor antigo antes de `addDomainEvent`.
7. `static create(props: Optional<Props, 'campos-com-default'>, id?: UniqueEntityID)`.
   - Defaults com `??` dentro do objeto: `createdAt: props.createdAt ?? new Date()`.
   - Evento de criação só quando `!id` (`const isNewAnswer = !id`) — assim a hidratação
     do banco não redispara evento.

## Value Object

Classe simples, `private constructor`, `static create()` e `static createFromText()`.
Sem herdar de `Entity`. Ex.: `Slug`.

## WatchedList

Listas de agregados (`QuestionAttachmentList`) herdam de `core/entities/watched-list.ts`
para rastrear `getNewItems()` / `getRemovedItems()` e o repositório persistir só o delta.

## Either

```ts
type XUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, { question: Question }>
```

- `left(erro)` para falha esperada, `right({ ... })` para sucesso.
- `Left` é o **erro** e `Right` é o **sucesso** — sempre nessa ordem.
- Quando o caso de uso não falha, o lado esquerdo é `null`: `Either<null, { ... }>`.
- Erros de caso de uso implementam `UseCaseError` e estendem `Error`, com mensagem fixa no
  construtor: `super('Resource not found')`. Ficam em `core/errors/errors/` quando genéricos,
  ou ao lado do use case quando específicos.

## Caso de uso

Estrutura fixa do arquivo:

```ts
interface <Nome>UseCaseRequest { /* tipos primitivos: string, number — nunca entidades */ }

type <Nome>UseCaseResponse = Either<Erro1 | Erro2, { entidade: Entidade }>

export class <Nome>UseCase {
  constructor(private xRepository: XRepository) {}

  async execute({ ... }: <Nome>UseCaseRequest): Promise<<Nome>UseCaseResponse> { }
}
```

- Request/Response **não são exportados** (só a classe é), salvo necessidade real.
- Entrada e saída do `Request` são primitivos; a conversão para `UniqueEntityID`
  acontece dentro do `execute`.
- Método público sempre chamado `execute`.
- Ordem interna: buscar → validar existência → validar autorização → mutar → persistir → `right`.

## Repositórios

- Interface em `application/repositories/<plural>-repository.ts`, métodos na ordem:
  `findById`, `findBy<X>`, `findMany<X>`, `save`, `create`, `delete`.
- Retornos `Promise<Entidade | null>` — **nunca lançar quando não encontra**.
- Paginação sempre por `PaginationParams { page: number }`, 20 itens por página.

## Eventos de domínio

- `DomainEvents.register(handler, EventoClass.name)` no `setupSubscriptions()` do subscriber.
- O disparo acontece no **repositório**, em `create`/`save`:
  `DomainEvents.dispatchEventsForAggregate(entidade.id)`.
- Subscriber implementa `EventHandler`, chama `this.setupSubscriptions()` no constructor
  e usa `.bind(this)` ao registrar.
