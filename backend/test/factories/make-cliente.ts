import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Cliente,
  ClienteProps,
} from '@/domain/triagem/enterprise/entities/cliente';

export function makeCliente(
  override: Partial<ClienteProps> = {},
  id?: UniqueEntityID,
) {
  const cliente = Cliente.create(
    {
      name: faker.person.fullName(),
      cpf: faker.string.numeric(11),
      nascimento: faker.date.birthdate({ min: 60, max: 85, mode: 'age' }),
      nb: faker.string.numeric(10),
      ...override,
    },
    id,
  );

  return cliente;
}
