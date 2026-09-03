import { Workflow } from '@/domain/triagem/enterprise/entities/workflow';

export class WorkflowPresenter {
  static toHTTP(workflow: Workflow) {
    return {
      id: workflow.id.toString(),
      nome: workflow.nome,
      ativo: workflow.ativo,
      sincronizadoEm: workflow.sincronizadoEm,
    };
  }
}
