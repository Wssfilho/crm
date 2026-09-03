import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  AcaoJudicial,
  AcaoJudicialProps,
} from '@/domain/triagem/enterprise/entities/acao-judicial';

export function makeAcaoJudicial(
  override: Partial<AcaoJudicialProps> = {},
  id?: UniqueEntityID,
) {
  const acaoJudicial = AcaoJudicial.create(
    {
      name: faker.lorem.sentence(),
      base: faker.lorem.words(3),
      ordem: 1,
      ...override,
    },
    id,
  );

  return acaoJudicial;
}
