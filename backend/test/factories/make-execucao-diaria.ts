import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  ExecucaoDiaria,
  ExecucaoDiariaProps,
} from '@/domain/triagem/enterprise/entities/execucao-diaria';

export function makeExecucaoDiaria(
  override: Partial<ExecucaoDiariaProps> = {},
  id?: UniqueEntityID,
) {
  const execucaoDiaria = ExecucaoDiaria.create(
    {
      data: faker.date.recent(),
      comAcao: faker.number.int({ min: 0, max: 10 }),
      semIrregularidade: faker.number.int({ min: 0, max: 10 }),
      ...override,
    },
    id,
  );

  return execucaoDiaria;
}
