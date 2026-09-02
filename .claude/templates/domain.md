# Templates — domínio

## Entidade (AggregateRoot)

```ts
import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface ExampleProps {
  authorId: UniqueEntityID;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Example extends AggregateRoot<ExampleProps> {
  get authorId() {
    return this.props.authorId;
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...');
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  set title(title: string) {
    this.props.title = title;
    this.touch();
  }

  set content(content: string) {
    this.props.content = content;
    this.touch();
  }

  static create(
    props: Optional<ExampleProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const example = new Example(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    const isNewExample = !id;

    if (isNewExample) {
      example.addDomainEvent(new ExampleCreatedEvent(example));
    }

    return example;
  }
}
```

## Caso de uso

```ts
import { Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { Example } from '@/domain/<contexto>/enterprise/entities/example';
import { ExamplesRepository } from '../repositories/examples-repository';

interface EditExampleUseCaseRequest {
  authorId: string;
  exampleId: string;
  title: string;
  content: string;
}

type EditExampleUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    example: Example;
  }
>;

export class EditExampleUseCase {
  constructor(private examplesRepository: ExamplesRepository) {}

  async execute({
    authorId,
    exampleId,
    title,
    content,
  }: EditExampleUseCaseRequest): Promise<EditExampleUseCaseResponse> {
    const example = await this.examplesRepository.findById(exampleId);

    if (!example) {
      return left(new ResourceNotFoundError());
    }

    if (authorId !== example.authorId.toString()) {
      return left(new NotAllowedError());
    }

    example.title = title;
    example.content = content;

    await this.examplesRepository.save(example);

    return right({
      example,
    });
  }
}
```

## Interface de repositório

```ts
import { PaginationParams } from '@/core/repositories/pagination-params';
import { Example } from '@/domain/<contexto>/enterprise/entities/example';

export interface ExamplesRepository {
  findById(id: string): Promise<Example | null>;
  findManyRecent(params: PaginationParams): Promise<Example[]>;
  save(example: Example): Promise<void>;
  create(example: Example): Promise<void>;
  delete(example: Example): Promise<void>;
}
```

## Subscriber de evento

```ts
import { DomainEvents } from '@/core/events/domain-events';
import { EventHandler } from '@/core/events/event-handler';
import { ExampleCreatedEvent } from '@/domain/<contexto>/enterprise/events/example-created-event';

export class OnExampleCreated implements EventHandler {
  constructor(private sendNotification: SendNotificationUseCase) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendExampleNotification.bind(this),
      ExampleCreatedEvent.name,
    );
  }

  private async sendExampleNotification({ example }: ExampleCreatedEvent) {
    await this.sendNotification.execute({
      recipientId: example.authorId.toString(),
      title: 'Novo exemplo criado',
      content: example.excerpt,
    });
  }
}
```
