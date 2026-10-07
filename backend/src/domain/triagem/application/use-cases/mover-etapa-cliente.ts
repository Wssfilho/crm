import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import {
  Cliente,
  EtapaCliente,
} from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';

interface MoverEtapaClienteUseCaseRequest {
  clienteId: string;
  etapa: EtapaCliente;
  usuarioId: string;
}

type MoverEtapaClienteUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    cliente: Cliente;
  }
>;

export class MoverEtapaClienteUseCase {
  constructor(
    private clientesRepository: ClientesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    clienteId,
    etapa,
    usuarioId,
  }: MoverEtapaClienteUseCaseRequest): Promise<MoverEtapaClienteUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    const usuario = await this.usersRepository.findById(usuarioId);

    if (!usuario) {
      return left(new ResourceNotFoundError());
    }

    cliente.moverParaEtapa(etapa, new UniqueEntityID(usuarioId));

    await this.clientesRepository.saveEtapa(cliente);

    return right({
      cliente,
    });
  }
}
