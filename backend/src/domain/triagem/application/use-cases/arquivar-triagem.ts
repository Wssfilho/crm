import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';

interface ArquivarTriagemUseCaseRequest {
  clienteId: string;
}

type ArquivarTriagemUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    cliente: Cliente;
  }
>;

export class ArquivarTriagemUseCase {
  constructor(private clientesRepository: ClientesRepository) {}

  async execute({
    clienteId,
  }: ArquivarTriagemUseCaseRequest): Promise<ArquivarTriagemUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    cliente.arquivar();

    await this.clientesRepository.save(cliente);

    return right({
      cliente,
    });
  }
}
