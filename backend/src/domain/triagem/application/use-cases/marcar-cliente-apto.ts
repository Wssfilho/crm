import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';

interface MarcarClienteAptoUseCaseRequest {
  clienteId: string;
}

type MarcarClienteAptoUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    cliente: Cliente;
  }
>;

export class MarcarClienteAptoUseCase {
  constructor(private clientesRepository: ClientesRepository) {}

  async execute({
    clienteId,
  }: MarcarClienteAptoUseCaseRequest): Promise<MarcarClienteAptoUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    cliente.marcarComoApto();

    await this.clientesRepository.save(cliente);

    return right({
      cliente,
    });
  }
}
