# Desvios observados no projeto de origem — NÃO copiar

Estes pontos existem em `05-nest` mas contrariam as convenções acima.
Ao levar o padrão para outro projeto, faça do jeito certo:

| Onde | O que está errado | O certo |
| --- | --- | --- |
| `create-account.controller.ts` | classe `createAccountController` em camelCase | `CreateAccountController` |
| `infra/prisma/PrismaClient.ts` | arquivo em PascalCase | `prisma-client.ts` (ou remover — o `PrismaService` já cobre) |
| `create-question.controller.ts` | `bodValidationPipe` (typo) | `bodyValidationPipe` |
| `authenticate.controller.ts` | `autheticateBodySchema` (typo); const e type com o **mesmo nome** | `authenticateBodySchema` / `AuthenticateBodySchema` |
| `fetch-recent-questions.e2e-spec.ts` | falta o `.controller` no nome | `fetch-recent-questions.controller.e2e-spec.ts` |
| Controllers de `infra/http` | acessam `PrismaService` direto, ignorando os casos de uso do domínio | controller chama o **use case**; o use case usa o repositório |
| `create-question.controller.ts` | `convertToSlug` privado duplicando `Slug.createFromText` | reutilizar o value object `Slug` |
| Raiz | `.eslintrc.json` legado convivendo com `eslint.config.mjs` | manter só o flat config |
| Raiz | `npm_comandos.txt` (histórico de shell colado) e `jest` no `package.json` sem uso | remover — o runner é o Vitest |
| `create-account.controller.ts` | mensagem `'User with same email adress alrady exists'` (typos) | `'User with same email address already exists'` |

> Regra geral: **classe sempre PascalCase, arquivo sempre kebab-case, e a `infra` nunca
> reimplementa regra que já existe no `domain`.**
