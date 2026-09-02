# Testes

Duas suítes separadas, dois configs de Vitest:

| Suíte | Comando | Arquivos | Config |
| --- | --- | --- | --- |
| Unitário | `npm test` | `*.spec.ts` | `vitest.config.ts` |
| E2E | `npm run test:e2e` | `*.e2e-spec.ts` | `vitest.config.e2e.ts` |

`globals: true` nos dois — `describe`/`it`/`expect` sem import.

## Testes unitários (casos de uso)

Padrão fixo:

```ts
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: EditQuestionUseCase;              // "sut" = system under test, sempre esse nome

describe('Edit Question', () => {          // nome do caso de uso, capitalizado, em inglês
  beforeEach(() => {
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(/* deps */);
    sut = new EditQuestionUseCase(inMemoryQuestionsRepository);
  });

  it('should be able to edit a question', async () => { ... });
  it('should not be able to edit a question from another user', async () => { ... });
});
```

- Variáveis declaradas com `let` **fora** do `describe`, instanciadas no `beforeEach`.
- Nomes de teste: `should be able to ...` para o caminho feliz,
  `should not be able to ...` para o caminho de erro. **Todo caso de uso tem os dois.**
- Assert de erro sempre em duas linhas:
  ```ts
  expect(result.isLeft()).toBe(true);
  expect(result.value).toBeInstanceOf(NotAllowedError);
  ```
- Dados de teste podem ser em português (`title: 'Pergunta teste'`).
- IDs legíveis nos testes: `new UniqueEntityID('author-1')`, `'question-1'`.
- Teste de evento de domínio usa `waitFor(() => expect(spy).toHaveBeenCalled())` (`test/utils/wait-for.ts`).

## In-memory repositories (`test/repositories/`)

- `export class InMemory<Plural>Repository implements <Plural>Repository`
- `public items: T[] = []` — os testes leem e escrevem `items` direto.
- Replicam o comportamento do repositório real, **inclusive o dispatch de eventos**
  (`DomainEvents.dispatchEventsForAggregate(...)` em `create`/`save`).
- Recebem outros repositórios in-memory por construtor quando há relacionamento.

## Factories (`test/factories/`)

```ts
export function makeQuestion(override: Partial<QuestionProps> = {}, id?: UniqueEntityID) {
  return Question.create({ authorId: new UniqueEntityID(), title: faker.lorem.sentence(), ...override }, id);
}
```

Assinatura sempre `(override = {}, id?)`, `...override` por último, dados via `@faker-js/faker`.

## Testes E2E

- Vivem **ao lado do controller**: `create-question.controller.e2e-spec.ts`.
- `describe('create questionController (E2E)')` — sufixo `(E2E)` obrigatório.
- Casos com `test('[POST] /questions - descrição')` — verbo e rota entre colchetes no começo.
- Boot: `Test.createTestingModule({ imports: [AppModule] }).compile()` em `beforeAll`,
  pegando `PrismaService` e `JwtService` do `moduleRef`, e `await app.init()`.
- Requests com `supertest`: `request(app.getHttpServer()).post('/questions').set('Authorization', ...)`.
- Assert em duas etapas: status HTTP **e** estado no banco (`prisma.question.findFirst`).
- **Isolamento**: `test/setup-e2e.ts` cria um schema Postgres com `randomUUID()` por arquivo,
  roda `prisma migrate deploy` naquele schema e faz `DROP SCHEMA ... CASCADE` no `afterAll`.
  Nunca escreva E2E que dependa do banco de desenvolvimento.
