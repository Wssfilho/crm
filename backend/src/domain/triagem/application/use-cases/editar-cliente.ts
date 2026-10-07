import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';

interface EditarClienteUseCaseRequest {
  clienteId: string;
  driveUrl?: string | null;
  observacao?: string | null;
  responsavelId?: string | null;
}

type EditarClienteUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    cliente: Cliente;
  }
>;

export class EditarClienteUseCase {
  constructor(
    private clientesRepository: ClientesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    clienteId,
    driveUrl,
    observacao,
    responsavelId,
  }: EditarClienteUseCaseRequest): Promise<EditarClienteUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    if (responsavelId) {
      const responsavel = await this.usersRepository.findById(responsavelId);

      if (!responsavel) {
        return left(new ResourceNotFoundError());
      }
    }

    if (driveUrl !== undefined) {
      cliente.driveUrl = driveUrl ?? undefined;
    }

    if (observacao !== undefined) {
      cliente.observacao = observacao ?? undefined;
    }

    if (responsavelId !== undefined) {
      cliente.responsavelId = responsavelId
        ? new UniqueEntityID(responsavelId)
        : undefined;
    }

    await this.clientesRepository.saveDetalhes(cliente);

    return right({
      cliente,
    });
  }
}
