import { ExecucaoDiaria } from '@/domain/triagem/enterprise/entities/execucao-diaria';

export abstract class ExecucoesRepository {
  abstract findMany(): Promise<ExecucaoDiaria[]>;
}
