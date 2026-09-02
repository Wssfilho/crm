# Templates — testes

## Spec de caso de uso

```ts
import { EditExampleUseCase } from './edit-example';
import { InMemoryExamplesRepository } from 'test/repositories/in-memory-examples-repository';
import { makeExample } from 'test/factories/make-example';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';

let inMemoryExamplesRepository: InMemoryExamplesRepository;
let sut: EditExampleUseCase;

describe('Edit Example', () => {
  beforeEach(() => {
    inMemoryExamplesRepository = new InMemoryExamplesRepository();
    sut = new EditExampleUseCase(inMemoryExamplesRepository);
  });

  it('should be able to edit an example', async () => {
    const newExample = makeExample(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('example-1'),
    );

    await inMemoryExamplesRepository.create(newExample);

    await sut.execute({
      exampleId: newExample.id.toValue(),
      authorId: 'author-1',
      title: 'Título teste',
      content: 'Conteúdo teste',
    });

    expect(inMemoryExamplesRepository.items[0]).toMatchObject({
      title: 'Título teste',
      content: 'Conteúdo teste',
    });
  });

  it('should not be able to edit an example from another user', async () => {
    const newExample = makeExample(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('example-1'),
    );

    await inMemoryExamplesRepository.create(newExample);

    const result = await sut.execute({
      exampleId: newExample.id.toValue(),
      authorId: 'author-2',
      title: 'Título teste',
      content: 'Conteúdo teste',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
```

## Repositório in-memory

```ts
import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { ExamplesRepository } from '@/domain/<contexto>/application/repositories/examples-repository';
import { Example } from '@/domain/<contexto>/enterprise/entities/example';

export class InMemoryExamplesRepository implements ExamplesRepository {
  public items: Example[] = [];

  async findById(id: string) {
    const example = this.items.find((item) => item.id.toString() === id);

    if (!example) {
      return null;
    }

    return example;
  }

  async findManyRecent({ page }: PaginationParams) {
    return this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);
  }

  async create(example: Example) {
    this.items.push(example);

    DomainEvents.dispatchEventsForAggregate(example.id);
  }

  async save(example: Example) {
    const itemIndex = this.items.findIndex((item) => item.id === example.id);

    this.items[itemIndex] = example;

    DomainEvents.dispatchEventsForAggregate(example.id);
  }

  async delete(example: Example) {
    const itemIndex = this.items.findIndex((item) => item.id === example.id);

    this.items.splice(itemIndex, 1);
  }
}
```

## Factory

```ts
import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Example,
  ExampleProps,
} from '@/domain/<contexto>/enterprise/entities/example';

export function makeExample(
  override: Partial<ExampleProps> = {},
  id?: UniqueEntityID,
) {
  const example = Example.create(
    {
      authorId: new UniqueEntityID(),
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  );

  return example;
}
```

## Spec E2E de controller

```ts
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Create Example Controller (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwt = moduleRef.get<JwtService>(JwtService);

    await app.init();
  });

  test('[POST] /examples - should create a new example', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .post('/examples')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My Example',
        content: 'My example content',
      });

    expect(response.status).toBe(201);

    const exampleOnDatabase = await prisma.example.findFirst({
      where: { title: 'My Example' },
    });

    expect(exampleOnDatabase).toBeTruthy();
  });
});
```
