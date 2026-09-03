import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FetchPainelUseCase } from '@/domain/triagem/application/use-cases/fetch-painel';
import { ExecucaoDiariaPresenter } from '@/infra/http/presenters/execucao-diaria-presenter';
import { WorkflowPresenter } from '@/infra/http/presenters/workflow-presenter';

@Controller('/painel')
@UseGuards(AuthGuard('jwt'))
export class FetchPainelController {
  constructor(private fetchPainel: FetchPainelUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchPainel.execute();

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return {
      execucoes: result.value.execucoes.map((execucao) =>
        ExecucaoDiariaPresenter.toHTTP(execucao),
      ),
      workflow: WorkflowPresenter.toHTTP(result.value.workflow),
    };
  }
}
