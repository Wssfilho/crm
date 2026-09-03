import { ExecucaoDiaria } from '@/domain/triagem/enterprise/entities/execucao-diaria';

export class ExecucaoDiariaPresenter {
  static toHTTP(execucao: ExecucaoDiaria) {
    return {
      id: execucao.id.toString(),
      data: execucao.data,
      comAcao: execucao.comAcao,
      semIrregularidade: execucao.semIrregularidade,
    };
  }
}
