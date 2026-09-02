# Ferramentas e configuração

## Scripts que eu sempre tenho no `package.json`

```json
{
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:cov": "vitest run --coverage",
  "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
}
```

## tsconfig.json — pontos que importam

- `"paths": { "@/*": ["./src/*"] }` com `"baseUrl": "./"` — é o que faz o alias e o `test/...` funcionarem.
- `"types": ["vitest/globals"]` — habilita `describe`/`it` sem import.
- `"strict": true`, `"strictNullChecks": true`, mas `"noImplicitAny": false` e
  `"strictBindCallApply": false` (afrouxados de propósito por causa dos decorators do Nest).
- `emitDecoratorMetadata` + `experimentalDecorators` ligados (Nest exige).
- `module`/`moduleResolution`: `nodenext`, `target: ES2023`.

## ESLint (flat config, `eslint.config.mjs`)

`eslint.configs.recommended` + `tseslint.configs.recommendedTypeChecked` +
`eslint-plugin-prettier/recommended`, com:

```js
'@typescript-eslint/no-explicit-any': 'off',
'@typescript-eslint/no-floating-promises': 'warn',
'@typescript-eslint/no-unsafe-argument': 'warn',
'prettier/prettier': ['error', { endOfLine: 'auto' }],
```

Quando uma regra atrapalha um caso legítimo do Nest (ex.: `request.user` sem tipo),
uso `// eslint-disable-next-line <regra>` pontual, com a regra nomeada — nunca disable amplo de arquivo
sem necessidade.

## Vitest

Os dois configs usam `unplugin-swc` (transpila decorators rápido) + `vite-tsconfig-paths`:

```ts
export default defineConfig({
  test: { globals: true, root: './' },
  plugins: [tsConfigPaths(), swc.vite({ module: { type: 'es6' } })],
});
```

O de E2E acrescenta `include: ['**/*.e2e-spec.ts']` e `setupFiles: ['./test/setup-e2e.ts']`.

## Docker Compose (Postgres local)

Porta **5433** no host para não colidir com Postgres nativo, volume em `./data/postgres`:

```yaml
services:
  postgres:
    container_name: postgres-<projeto>
    image: postgres
    ports: ['5433:5432']
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: docker
      POSTGRES_DB: <projeto>
      PGDATA: /data/postgres
    volumes: ['./data/postgres:/data/postgres']
```

## .gitignore — o que eu sempre acrescento ao padrão do Nest

```
/generated/prisma
/data/postgres
*.pem
.env
```

## Outros hábitos

- `client.http` na raiz para testar rotas manualmente (REST Client do VS Code),
  com `@baseurl` e captura de token: `@authToken = {{authenticate.response.body.access_token}}`.
- `prisma.config.ts` na raiz apontando schema, migrations e `datasource.url` a partir do `.env`.
