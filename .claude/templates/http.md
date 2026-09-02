# Templates — HTTP (NestJS)

## Controller autenticado com body

```ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';

const createExampleBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createExampleBodySchema);

type CreateExampleBodySchema = z.infer<typeof createExampleBodySchema>;

@Controller('/examples')
@UseGuards(AuthGuard('jwt'))
export class CreateExampleController {
  constructor(private createExample: CreateExampleUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateExampleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content } = body;

    const result = await this.createExample.execute({
      authorId: user.sub,
      title,
      content,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
```

## Controller com query paginada

```ts
const pageQueryParamSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
});

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/examples')
@UseGuards(AuthGuard('jwt'))
export class FetchRecentExamplesController {
  constructor(private fetchRecentExamples: FetchRecentExamplesUseCase) {}

  @Get()
  async handle(@Query(queryValidationPipe) query: PageQueryParamSchema) {
    const result = await this.fetchRecentExamples.execute({ page: query.page });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { examples: result.value.examples };
  }
}
```

## Módulo HTTP

```ts
import { Module } from '@nestjs/common';
import { CreateExampleController } from './controllers/create-example.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CreateExampleController],
  providers: [PrismaService],
})
export class HttpModule {}
```
