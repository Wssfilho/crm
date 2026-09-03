import { ExecucoesRepository } from '@/domain/triagem/application/repositories/execucoes-repository';
import { ExecucaoDiaria } from '@/domain/triagem/enterprise/entities/execucao-diaria';

export class InMemoryExecucoesRepository implements ExecucoesRepository {
  public items: ExecucaoDiaria[] = [];

  async findMany() {
    return this.items;
  }
}
