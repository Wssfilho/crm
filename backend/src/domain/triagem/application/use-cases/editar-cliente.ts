import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';
import { ClienteAlreadyExistsError } from './errors/cliente-already-exists-error';

interface EditarClienteUseCaseRequest {
  clienteId: string;
  name?: string;
  cpf?: string;
  nascimento?: Date | null;
  telefone?: string | null;
  municipio?: string | null;
  nb?: string;
  especie?: string | null;
  rendaEmCentavos?: number | null;
  driveUrl?: string | null;
  observacao?: string | null;
  responsavelId?: string | null;
}

type EditarClienteUseCaseResponse = Either<
  ResourceNotFoundError | ClienteAlreadyExistsError,
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
    name,
    cpf,
    nascimento,
    telefone,
    municipio,
    nb,
    especie,
    rendaEmCentavos,
    driveUrl,
    observacao,
    responsavelId,
  }: EditarClienteUseCaseRequest): Promise<EditarClienteUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    if (cpf !== undefined && cpf !== cliente.cpf) {
      const clienteComMesmoCpf = await this.clientesRepository.findByCpf(cpf);

      if (clienteComMesmoCpf && !clienteComMesmoCpf.id.equals(cliente.id)) {
        return left(new ClienteAlreadyExistsError(cpf));
      }
    }

    if (responsavelId) {
      const responsavel = await this.usersRepository.findById(responsavelId);

      if (!responsavel) {
        return left(new ResourceNotFoundError());
      }
    }

    if (name !== undefined) {
      cliente.name = name;
    }

    if (cpf !== undefined) {
      cliente.cpf = cpf;
    }

    if (nascimento !== undefined) {
      cliente.nascimento = nascimento ?? undefined;
    }

    if (telefone !== undefined) {
      cliente.telefone = telefone ?? undefined;
    }

    if (municipio !== undefined) {
      cliente.municipio = municipio ?? undefined;
    }

    if (nb !== undefined) {
      cliente.nb = nb;
    }

    if (especie !== undefined) {
      cliente.especie = especie ?? undefined;
    }

    if (rendaEmCentavos !== undefined) {
      cliente.rendaEmCentavos = rendaEmCentavos ?? undefined;
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
