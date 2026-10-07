import { Module } from '@nestjs/common';
import { ChangeUserPasswordUseCase } from '@/domain/account/application/use-cases/change-user-password';
import { EditUserProfileUseCase } from '@/domain/account/application/use-cases/edit-user-profile';
import { AuthenticateUserUseCase } from '@/domain/account/application/use-cases/authenticate-user';
import { GetUserProfileUseCase } from '@/domain/account/application/use-cases/get-user-profile';
import { RegisterUserUseCase } from '@/domain/account/application/use-cases/register-user';
import { UsersRepository } from '@/domain/account/application/repositories/users-repository';
import { Encrypter } from '@/domain/account/application/cryptography/encrypter';
import { HashComparer } from '@/domain/account/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/account/application/cryptography/hash-generator';
import { ClientesRepository } from '@/domain/triagem/application/repositories/clientes-repository';
import { ExecucoesRepository } from '@/domain/triagem/application/repositories/execucoes-repository';
import { ProdutosRepository } from '@/domain/triagem/application/repositories/produtos-repository';
import { WorkflowRepository } from '@/domain/triagem/application/repositories/workflow-repository';
import { AlternarWorkflowUseCase } from '@/domain/triagem/application/use-cases/alternar-workflow';
import { ArquivarTriagemUseCase } from '@/domain/triagem/application/use-cases/arquivar-triagem';
import { CriarClienteUseCase } from '@/domain/triagem/application/use-cases/criar-cliente';
import { DeletarClienteUseCase } from '@/domain/triagem/application/use-cases/deletar-cliente';
import { FetchClientesUseCase } from '@/domain/triagem/application/use-cases/fetch-clientes';
import { FetchPainelUseCase } from '@/domain/triagem/application/use-cases/fetch-painel';
import { FetchProdutosUseCase } from '@/domain/triagem/application/use-cases/fetch-produtos';
import { MarcarClienteAptoUseCase } from '@/domain/triagem/application/use-cases/marcar-cliente-apto';
import { MoverColunaClienteUseCase } from '@/domain/triagem/application/use-cases/mover-coluna-cliente';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { PrismaModule } from '@/infra/prisma/prisma.module';
import { AlternarWorkflowController } from './controllers/alternar-workflow.controller';
import { ArquivarTriagemController } from './controllers/arquivar-triagem.controller';
import { AuthenticateController } from './controllers/authenticate.controller';
import { ChangePasswordController } from './controllers/change-password.controller';
import { CreateAccountController } from './controllers/create-account.controller';
import { CriarClienteController } from './controllers/criar-cliente.controller';
import { DeletarClienteController } from './controllers/deletar-cliente.controller';
import { EditProfileController } from './controllers/edit-profile.controller';
import { FetchClientesController } from './controllers/fetch-clientes.controller';
import { FetchPainelController } from './controllers/fetch-painel.controller';
import { FetchProdutosController } from './controllers/fetch-produtos.controller';
import { GetProfileController } from './controllers/get-profile.controller';
import { MarcarClienteAptoController } from './controllers/marcar-cliente-apto.controller';
import { MoverColunaClienteController } from './controllers/mover-coluna-cliente.controller';

@Module({
  imports: [PrismaModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    GetProfileController,
    EditProfileController,
    ChangePasswordController,
    FetchClientesController,
    CriarClienteController,
    DeletarClienteController,
    FetchProdutosController,
    MarcarClienteAptoController,
    MoverColunaClienteController,
    ArquivarTriagemController,
    FetchPainelController,
    AlternarWorkflowController,
  ],
  providers: [
    {
      provide: RegisterUserUseCase,
      useFactory: (
        usersRepository: UsersRepository,
        hashGenerator: HashGenerator,
      ) => new RegisterUserUseCase(usersRepository, hashGenerator),
      inject: [UsersRepository, HashGenerator],
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (
        usersRepository: UsersRepository,
        hashComparer: HashComparer,
        encrypter: Encrypter,
      ) =>
        new AuthenticateUserUseCase(usersRepository, hashComparer, encrypter),
      inject: [UsersRepository, HashComparer, Encrypter],
    },
    {
      provide: GetUserProfileUseCase,
      useFactory: (usersRepository: UsersRepository) =>
        new GetUserProfileUseCase(usersRepository),
      inject: [UsersRepository],
    },
    {
      provide: EditUserProfileUseCase,
      useFactory: (usersRepository: UsersRepository) =>
        new EditUserProfileUseCase(usersRepository),
      inject: [UsersRepository],
    },
    {
      provide: ChangeUserPasswordUseCase,
      useFactory: (
        usersRepository: UsersRepository,
        hashComparer: HashComparer,
        hashGenerator: HashGenerator,
      ) =>
        new ChangeUserPasswordUseCase(
          usersRepository,
          hashComparer,
          hashGenerator,
        ),
      inject: [UsersRepository, HashComparer, HashGenerator],
    },
    {
      provide: FetchClientesUseCase,
      useFactory: (clientesRepository: ClientesRepository) =>
        new FetchClientesUseCase(clientesRepository),
      inject: [ClientesRepository],
    },
    {
      provide: CriarClienteUseCase,
      useFactory: (clientesRepository: ClientesRepository) =>
        new CriarClienteUseCase(clientesRepository),
      inject: [ClientesRepository],
    },
    {
      provide: DeletarClienteUseCase,
      useFactory: (clientesRepository: ClientesRepository) =>
        new DeletarClienteUseCase(clientesRepository),
      inject: [ClientesRepository],
    },
    {
      provide: FetchProdutosUseCase,
      useFactory: (produtosRepository: ProdutosRepository) =>
        new FetchProdutosUseCase(produtosRepository),
      inject: [ProdutosRepository],
    },
    {
      provide: MarcarClienteAptoUseCase,
      useFactory: (clientesRepository: ClientesRepository) =>
        new MarcarClienteAptoUseCase(clientesRepository),
      inject: [ClientesRepository],
    },
    {
      provide: MoverColunaClienteUseCase,
      useFactory: (clientesRepository: ClientesRepository) =>
        new MoverColunaClienteUseCase(clientesRepository),
      inject: [ClientesRepository],
    },
    {
      provide: ArquivarTriagemUseCase,
      useFactory: (clientesRepository: ClientesRepository) =>
        new ArquivarTriagemUseCase(clientesRepository),
      inject: [ClientesRepository],
    },
    {
      provide: FetchPainelUseCase,
      useFactory: (
        execucoesRepository: ExecucoesRepository,
        workflowRepository: WorkflowRepository,
      ) => new FetchPainelUseCase(execucoesRepository, workflowRepository),
      inject: [ExecucoesRepository, WorkflowRepository],
    },
    {
      provide: AlternarWorkflowUseCase,
      useFactory: (workflowRepository: WorkflowRepository) =>
        new AlternarWorkflowUseCase(workflowRepository),
      inject: [WorkflowRepository],
    },
  ],
})
export class HttpModule {}
