# Camada de infra (NestJS)

## Módulos

- `AppModule` monta o `ConfigModule.forRoot({ validate: (env) => envSchema.parse(env), isGlobal: true })`
  e importa `AuthModule` e `HttpModule`.
- `HttpModule` concentra **todos** os controllers e seus providers.
- `AuthModule` registra `PassportModule` + `JwtModule.registerAsync({ global: true })`.

## Environment

`src/infra/env.ts` — schema Zod + type inferido:

```ts
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  PORT: z.coerce.number().optional().default(3333),
});
export type Env = z.infer<typeof envSchema>;
```

- Leitura sempre tipada: `config.get('PORT', { infer: true })` com `ConfigService<Env, true>`.
- `main.ts` começa com `import 'dotenv/config'`.
- Nunca ler `process.env` fora de `env.ts` / `prisma.service.ts` / `setup-e2e.ts`.

## Controllers

- **Um controller por caso de uso** — não agrupe rotas no mesmo arquivo.
- Método público único, sempre chamado `handle`.
- Schema Zod declarado **no topo do arquivo**, fora da classe, junto com o type inferido:
  ```ts
  const createQuestionBodySchema = z.object({ title: z.string(), content: z.string() });
  type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;
  ```
- Validação por `ZodValidationPipe`, de duas formas (as duas existem no projeto —
  **prefira a do pipe no parâmetro**, que também valida query):
  - `@Body(bodyValidationPipe) body: CreateQuestionBodySchema` — pipe instanciado como const no módulo do arquivo;
  - `@UsePipes(new ZodValidationPipe(schema))` no método.
- Rota protegida: `@UseGuards(AuthGuard('jwt'))` na **classe** + `@CurrentUser() user: UserPayload`.
- `@HttpCode(201)` explícito quando o status difere do padrão do verbo.
- Erros HTTP com exceptions do Nest: `ConflictException`, `UnauthorizedException`, `BadRequestException`.
- Mensagens de erro de autenticação genéricas: `'Email or password invalid'` (não revela qual falhou).

## ZodValidationPipe

`src/infra/http/pipes/zod-validation-pipe.ts` — recebe o schema no construtor,
faz `parse`, e converte `ZodError` em `BadRequestException` com
`{ message: 'validation error', errors: treeifyError(error) }`.

## Auth

- JWT **RS256** com chaves PEM guardadas em base64 nas envs `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`,
  decodificadas com `Buffer.from(key, 'base64')`.
- `jwt.strategy.ts` valida o payload com Zod (`z.object({ sub: z.string().uuid() })`)
  e exporta `export type UserPayload = z.infer<typeof TokenPayloadSchema>`.
- `current-user-decorator.ts` cria `@CurrentUser()` via `createParamDecorator`.
- Geração das chaves:
  ```bash
  openssl genrsa -out private_key.pem 2048
  openssl rsa -in private_key.pem -pubout -out public_key.pem
  base64 -i private_key.pem | pbcopy   # macOS
  ```
- `*.pem` está no `.gitignore` — chaves nunca vão para o repositório.

## Prisma

- `generator client` com `provider = "prisma-client"` e `output = "../src/generated/prisma"`.
  A pasta gerada **não se edita** e está no `.gitignore`.
- `PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy`,
  usando o adapter `PrismaPg` construído a partir da `DATABASE_URL` (com suporte a `?schema=`).
- `$connect()` em `onModuleInit`, `$disconnect()` em `onModuleDestroy`.
- Modelos: `@@map("tabelas_no_plural")`, colunas `@map("snake_case")`, `id String @id @default(uuid())`.
