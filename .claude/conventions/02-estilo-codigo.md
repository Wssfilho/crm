# Estilo de código — a minha maneira de escrever

## Formatação (Prettier)

```json
{ "singleQuote": true, "trailingComma": "all" }
```

- Aspas simples, vírgula final em tudo, **ponto e vírgula sim**, 2 espaços, ~80 colunas.
- `prettier/prettier` roda como regra de ESLint com `endOfLine: "auto"`.

## Nomenclatura

| Coisa | Padrão | Exemplo |
| --- | --- | --- |
| Arquivo | `kebab-case.ts` | `edit-question.ts`, `unique-entity-id.ts` |
| Classe / interface / type | `PascalCase` | `EditQuestionUseCase`, `QuestionProps` |
| Variável / função / método | `camelCase` | `questionAttachmentList`, `makeQuestion()` |
| Caso de uso (arquivo) | `<verbo>-<substantivo>.ts` | `fetch-recent-questions.ts` |
| Caso de uso (classe) | `<Verbo><Substantivo>UseCase` | `FetchRecentQuestionsUseCase` |
| Request/Response do use case | `<Nome>UseCaseRequest` / `...Response` | `EditQuestionUseCaseRequest` |
| Repositório (interface) | `<Plural>Repository` | `QuestionsRepository` |
| Repositório in-memory | `InMemory<Plural>Repository` | `InMemoryQuestionsRepository` |
| Controller | `<Acao>Controller` em `<acao>.controller.ts` | `CreateQuestionController` |
| Evento de domínio | `<Coisa><Passado>Event` | `AnswerCreatedEvent` |
| Subscriber | `On<Evento>` em `on-<evento>.ts` | `OnAnswerCreated` |
| Factory de teste | `make<Entidade>()` | `makeQuestion()` |
| Schema Zod | `camelCase` + type inferido `PascalCase` | `createQuestionBodySchema` / `CreateQuestionBodySchema` |
| Tabela no Prisma | modelo `PascalCase` singular, `@@map` plural snake_case | `Question` → `questions` |
| Coluna no Prisma | campo `camelCase`, `@map` snake_case | `authorId` → `author_id` |

## Imports

- **Alias `@/` para `src/`** (`tsconfig.paths`), usado para qualquer import que cruze pasta.
- Import relativo (`./`, `../`) só para arquivos vizinhos dentro da mesma feature.
- Nos testes, `test/...` sem alias (funciona pelo `baseUrl: "./"`).
- Sem barrel files. Import de tipo puro usa `import type { ... }` quando o `isolatedModules` exige.
- Ordem que eu escrevo: libs externas → `@/core` → `@/domain` → `@/infra` → relativos.
  (Não é imposto por lint, mas é o hábito — mantenha.)

## Jeito de escrever

- **Early return sempre.** Guarda no topo, sem `else`:
  ```ts
  if (!question) {
    return left(new ResourceNotFoundError());
  }
  ```
- **Linha em branco entre blocos lógicos** — nunca um bloco denso de 15 linhas coladas.
- **Sem comentários explicando o óbvio.** Comentário só como JSDoc em utilitário genérico
  (`Optional`, `Slug.createFromText`, `waitFor`), com `@example` / `@param`.
- **Desestruturação nos parâmetros** de `execute({ authorId, questionId })` e de
  handlers de evento (`{ answer }: AnswerCreatedEvent`).
- **Constructor com `private`** para injeção — sem atribuição manual:
  ```ts
  constructor(
    private questionsRepository: QuestionsRepository,
    private questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}
  ```
- **Getters em vez de propriedades públicas** nas entidades; mutação só por setter que chama `touch()`.
- **`Either` em vez de `throw`** na camada de domínio/aplicação. `throw` só na `infra` (exceptions do Nest).
- Retorno de objeto nomeado: `return right({ question })`, nunca `return right(question)`.
- Nomes descritivos por extenso (`currentQuestionAttachments`), sem abreviação.
