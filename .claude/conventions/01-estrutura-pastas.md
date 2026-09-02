# Estrutura de pastas

```
prisma/
  schema.prisma
  migrations/
src/
  core/                                  # genérico, reutilizável entre projetos
    either.ts
    entities/
      entity.ts
      aggregate-root.ts
      unique-entity-id.ts
      watched-list.ts
    errors/
      use-case-error.ts
      errors/
        not-allowed-error.ts
        resource-not-found-error.ts
    events/
      domain-event.ts
      domain-events.ts
      event-handler.ts
    repositories/
      pagination-params.ts
    types/
      optional.ts
  domain/
    <contexto>/                          # ex.: forum, notification
      enterprise/
        entities/
          <entidade>.ts
          <entidade>-list.ts             # WatchedList de um agregado
          value-objects/
            <vo>.ts
        events/
          <algo>-created-event.ts
      application/
        repositories/                    # SÓ interfaces
          <plural>-repository.ts
        use-cases/
          <verbo>-<substantivo>.ts
          <verbo>-<substantivo>.spec.ts  # spec ao lado do arquivo
        subscribers/
          on-<evento>.ts
          on-<evento>.spec.ts
  infra/
    main.ts                              # entryFile do nest-cli
    app.module.ts
    env.ts                               # schema Zod do ambiente
    auth/
      auth.module.ts
      jwt.strategy.ts
      current-user-decorator.ts
    http/
      http.module.ts
      pipes/
        zod-validation-pipe.ts
      controllers/
        <acao>.controller.ts
        <acao>.controller.e2e-spec.ts    # e2e ao lado do controller
    prisma/
      prisma.service.ts
  generated/prisma/                      # gerado — nunca editar à mão
test/
  factories/
    make-<entidade>.ts
  repositories/
    in-memory-<plural>-repository.ts
  utils/
    wait-for.ts
  setup-e2e.ts
```

## Regras de localização

- **Teste mora ao lado do código que testa** (`create-question.ts` / `create-question.spec.ts`).
- **Dublês de teste moram em `test/`**, nunca em `src/` — in-memory repositories e factories
  são compartilhados entre specs.
- Um arquivo por classe/caso de uso. Sem barrel files (`index.ts`) — imports são explícitos.
- `main.ts` fica em `src/infra/`, não na raiz de `src/` (`nest-cli.json` → `"entryFile": "infra/main"`).
