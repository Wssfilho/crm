import {
  Controller,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlternarWorkflowUseCase } from '@/domain/triagem/application/use-cases/alternar-workflow';
import { WorkflowPresenter } from '@/infra/http/presenters/workflow-presenter';

@Controller('/painel/workflow')
@UseGuards(AuthGuard('jwt'))
export class AlternarWorkflowController {
  constructor(private alternarWorkflow: AlternarWorkflowUseCase) {}

  @Patch()
  async handle() {
    const result = await this.alternarWorkflow.execute();

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { workflow: WorkflowPresenter.toHTTP(result.value.workflow) };
  }
}
