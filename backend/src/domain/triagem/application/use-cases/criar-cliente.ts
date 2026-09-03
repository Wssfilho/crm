import { Either, left, right } from '@/core/either';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { ClientesRepository } from '../repositories/clientes-repository';
import { ClienteAlreadyExistsError } from './errors/cliente-already-exists-error';

interface CriarClienteUseCaseRequest {
  name: string;
  cpf: string;
  nascimento?: Date;
  telefone?: string;
  municipio?: string;
  nb: string;
  especie?: string;
  rendaEmCentavos?: number;
  procuracao?: boolean;
  extratoBeneficio?: boolean;
  extratoEmprestimos?: boolean;
  enviarParaAnalise?: boolean;
}

type CriarClienteUseCaseResponse = Either<
  ClienteAlreadyExistsError,
  {
    cliente: Cliente;
  }
>;

/**
 * O produto/tese não é escolhido no cadastro: o cliente entra na fila sem
 * tese definida e a triagem atribui depois.
 */
export class CriarClienteUseCase {
  constructor(private clientesRepository: ClientesRepository) {}

  async execute({
    name,
    cpf,
    nascimento,
    telefone,
    municipio,
    nb,
    especie,
    rendaEmCentavos,
    procuracao,
    extratoBeneficio,
    extratoEmprestimos,
    enviarParaAnalise,
  }: CriarClienteUseCaseRequest): Promise<CriarClienteUseCaseResponse> {
    const clienteComMesmoCpf = await this.clientesRepository.findByCpf(cpf);

    if (clienteComMesmoCpf) {
      return left(new ClienteAlreadyExistsError(cpf));
    }

    const cliente = Cliente.create({
      name,
      cpf,
      nascimento,
      telefone,
      municipio,
      nb,
      especie,
      rendaEmCentavos,
      coluna: enviarParaAnalise ? 'ANALISE' : 'NOVO',
      procuracao,
      extratoBeneficio,
      extratoEmprestimos,
    });

    await this.clientesRepository.create(cliente);

    return right({
      cliente,
    });
  }
}
