import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import {
  Cliente,
  ColunaKanban,
} from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';

interface MoverColunaClienteUseCaseRequest {
  clienteId: string;
  coluna: ColunaKanban;
}

type MoverColunaClienteUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    cliente: Cliente;
  }
>;

export class MoverColunaClienteUseCase {
  constructor(private clientesRepository: ClientesRepository) {}

  async execute({
    clienteId,
    coluna,
  }: MoverColunaClienteUseCaseRequest): Promise<MoverColunaClienteUseCaseResponse> {
    const cliente = await this.clientesRepository.findById(clienteId);

    if (!cliente) {
      return left(new ResourceNotFoundError());
    }

    cliente.moverParaColuna(coluna);

    await this.clientesRepository.save(cliente);

    return right({
      cliente,
    });
  }
}
