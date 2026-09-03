import { Either, right } from '@/core/either';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';

type FetchClientesUseCaseResponse = Either<
  null,
  {
    clientes: Cliente[];
  }
>;

export class FetchClientesUseCase {
  constructor(private clientesRepository: ClientesRepository) {}

  async execute(): Promise<FetchClientesUseCaseResponse> {
    const clientes = await this.clientesRepository.findMany();

    return right({
      clientes,
    });
  }
}
