import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Produto } from '@/domain/triagem/enterprise/entities/produto';
import { Produto as PrismaProduto } from '@/generated/prisma/client';

export class PrismaProdutoMapper {
  static toDomain(raw: PrismaProduto): Produto {
    return Produto.create(
      {
        slug: raw.slug,
        name: raw.name,
        mono: raw.mono,
        gradiente: raw.gradiente,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
