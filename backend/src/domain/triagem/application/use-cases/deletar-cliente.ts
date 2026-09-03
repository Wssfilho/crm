import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { ClientesRepository } from '../repositories/clientes-repository';

interface DeletarClienteUseCaseRequest {
  clienteId: string;
}

type DeletarClienteUseCaseResponse = Either<ResourceNotFoundError, null>;

export class DeletarClienteUseCase {
  constructor(private clientesRepository: ClientesRepository) {}

  async execute({
    clienteId,
  }: DeletarClienteUseCaseRequest): Promise<DeletarClienteUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    await this.clientesRepository.delete(cliente);

    return right(null);
  }
}
