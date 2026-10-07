# Kanban de andamento do cliente — design

Data: 2026-10-07 · Status: aprovado em conversa, aguardando revisão da spec

## Objetivo

Todo o escritório, cada pessoa com sua conta, acompanha em que etapa está cada
cliente. A triagem por n8n (análise de irregularidades) **não será usada por
enquanto**, mas não deve ser apagada.

Etapas:

1. **Comercial** — o cliente chega e a documentação é colocada no Google Drive.
2. **Protocolo** — documentação pronta; o setor de protocolo protocola.
3. **Concluído** — todos os processos daquela pessoa foram finalizados.

A mudança de etapa é **manual** (arrastar o card). Qualquer usuário logado pode
mover e editar qualquer cliente.

## Fora do escopo

- Histórico completo de movimentações (só a última: quem e quando).
- Controle de processos individuais por cliente.
- Permissões por setor.
- Tempo real (WebSocket). Atualização por polling basta.
- Remover código da triagem n8n — só sai da navegação.

## Dados

Novo enum e campos em `Cliente` (`prisma/schema.prisma`):

```prisma
enum EtapaCliente {
  COMERCIAL
  PROTOCOLO
  CONCLUIDO

  @@map("etapa_cliente")
}

model Cliente {
  // ...campos atuais intactos (status, coluna, docs etc.)
  etapa         EtapaCliente @default(COMERCIAL)
  driveUrl      String?      @map("drive_url")
  observacao    String?
  responsavelId String?      @map("responsavel_id")
  movidoPorId   String?      @map("movido_por_id")
  movidoEm      DateTime?    @map("movido_em")

  responsavel User? @relation("ClienteResponsavel", fields: [responsavelId], references: [id], onDelete: SetNull)
  movidoPor   User? @relation("ClienteMovidoPor", fields: [movidoPorId], references: [id], onDelete: SetNull)
}
```

- Migration `kanban_andamento`: clientes existentes ficam em `COMERCIAL` pelo default.
- `observacao` limitada a 280 caracteres na validação HTTP.
- `driveUrl` validado como URL (`z.string().url()`), aceito vazio para limpar.

## Domínio (`domain/triagem`)

- `Cliente` (entidade): getters/setters de `etapa`, `driveUrl`, `observacao`,
  `responsavelId`, `movidoPorId`, `movidoEm`. Método
  `moverParaEtapa(etapa, movidoPorId)` grava `movidoPorId` e `movidoEm = new Date()`
  e chama `touch()`. Os IDs de usuário são `UniqueEntityID` (sem importar a
  entidade `User` de outro contexto).
- `MoverEtapaClienteUseCase` — `{ clienteId, etapa, usuarioId }` →
  `Either<ResourceNotFoundError, { cliente }>`. Mover para a mesma etapa é no-op
  de sucesso (não altera `movidoEm`).
- `EditarClienteUseCase` — `{ clienteId, driveUrl?, observacao?, responsavelId? }`
  (`null` limpa o campo; `undefined` não mexe) →
  `Either<ResourceNotFoundError, { cliente }>`. Se `responsavelId` não existir em
  usuários → `ResourceNotFoundError`.
- `CriarClienteUseCase`: novos clientes nascem em `COMERCIAL`.

## Domínio (`domain/account`)

- `FetchUsuariosUseCase` — `Either<null, { users }>`, ordenado por nome.
  Novo método `findMany()` no `UsersRepository`.

## HTTP (todas com `AuthGuard('jwt')`)

| Verbo | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| `PATCH` | `/clientes/:clienteId/etapa` | `{ etapa }` | `{ cliente }` |
| `PATCH` | `/clientes/:clienteId` | `{ driveUrl?, observacao?, responsavelId? }` | `{ cliente }` |
| `GET` | `/usuarios` | — | `{ usuarios: [{ id, name, email }] }` |

- `usuarioId` do movimento vem de `@CurrentUser()`, nunca do corpo.
- `ClientePresenter` passa a expor `etapa`, `driveUrl`, `observacao`,
  `responsavelId`, `movidoPorId`, `movidoEm`. O front cruza os IDs com
  `GET /usuarios` para exibir nomes (sem join no backend).
- 404 para cliente/responsável inexistente; 400 para corpo inválido.

## Frontend

- Rota `/` passa a ser o **Kanban de andamento** (3 colunas, largura total).
  A tela de lista de clientes e o painel n8n saem do menu e do router; os
  arquivos permanecem no repositório.
- Card: nome, observação (2 linhas, truncada), avatar com iniciais do
  responsável, botão "Drive ↗" (abre `driveUrl` em nova aba, só se houver),
  rodapé "movido por {nome} · há {tempo}".
- Arrastar entre colunas → `PATCH /etapa` com atualização otimista e rollback +
  toast em caso de erro (reaproveita o padrão do kanban atual).
- Clique no card → painel lateral com campos editáveis: link do Drive,
  observação, responsável (select com `GET /usuarios`) e botão Salvar.
- Busca da topbar filtra por nome/CPF/NB; "+ Novo cliente" continua.
- TanStack Query: `refetchInterval: 30_000` e `refetchOnWindowFocus: true` na
  lista de clientes.

## Testes

- Unitários: `mover-etapa-cliente.spec.ts` (move e grava quem/quando; cliente
  inexistente), `editar-cliente.spec.ts` (edita campos; limpa com `null`;
  cliente inexistente; responsável inexistente), `fetch-usuarios.spec.ts`.
- E2E: `mover-etapa-cliente.controller.e2e-spec.ts`,
  `editar-cliente.controller.e2e-spec.ts`, `fetch-usuarios.controller.e2e-spec.ts`
  — status HTTP e estado no banco.
- `client.http` com as três chamadas novas.
