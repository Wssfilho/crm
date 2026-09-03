import { Module } from '@nestjs/common';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { ClientesRepository } from '@/domain/triagem/application/repositories/clientes-repository';
import { ExecucoesRepository } from '@/domain/triagem/application/repositories/execucoes-repository';
import { ProdutosRepository } from '@/domain/triagem/application/repositories/produtos-repository';
import { WorkflowRepository } from '@/domain/triagem/application/repositories/workflow-repository';
import { PrismaService } from './prisma.service';
import { PrismaClientesRepository } from './repositories/prisma-clientes-repository';
import { PrismaExecucoesRepository } from './repositories/prisma-execucoes-repository';
import { PrismaProdutosRepository } from './repositories/prisma-produtos-repository';
import { PrismaUsersRepository } from './repositories/prisma-users-repository';
import { PrismaWorkflowRepository } from './repositories/prisma-workflow-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: ClientesRepository,
      useClass: PrismaClientesRepository,
    },
    {
      provide: ProdutosRepository,
      useClass: PrismaProdutosRepository,
    },
    {
      provide: ExecucoesRepository,
      useClass: PrismaExecucoesRepository,
    },
    {
      provide: WorkflowRepository,
      useClass: PrismaWorkflowRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    ClientesRepository,
    ProdutosRepository,
    ExecucoesRepository,
    WorkflowRepository,
  ],
})
export class PrismaModule {}
