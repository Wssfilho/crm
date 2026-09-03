import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Produto,
  ProdutoProps,
} from '@/domain/triagem/enterprise/entities/produto';

export function makeProduto(
  override: Partial<ProdutoProps> = {},
  id?: UniqueEntityID,
) {
  const produto = Produto.create(
    {
      slug: faker.lorem.slug(),
      name: faker.commerce.productName(),
      mono: faker.string.alpha({ length: 2, casing: 'upper' }),
      gradiente: 'linear-gradient(135deg,#4f46e5,#6366f1)',
      ...override,
    },
    id,
  );

  return produto;
}
