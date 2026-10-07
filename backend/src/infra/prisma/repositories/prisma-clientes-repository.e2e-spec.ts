import { Test } from '@nestjs/testing';
import { ClientesRepository } from '@/domain/triagem/application/repositories/clientes-repository';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

describe('PrismaClientesRepository (E2E)', () => {
  let prisma: PrismaService;
  let clientesRepository: ClientesRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    clientesRepository = moduleRef.get(ClientesRepository);
  });

  test('[saveDetalhes] - should not revert an etapa moved by someone else', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Ana Protocolo',
        email: 'ana.repo@advocacia.com.br',
        password: '123456',
      },
    });

    const { id } = await prisma.cliente.create({
      data: {
        name: 'Maria da Silva',
        cpf: '12345678909',
        nb: '1234567890',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const clienteDesatualizado = await clientesRepository.findById(id);

    const clienteAtual = await clientesRepository.findById(id);
    clienteAtual!.moverParaEtapa('PROTOCOLO', new UniqueEntityID(user.id));
    await clientesRepository.saveEtapa(clienteAtual!);

    clienteDesatualizado!.observacao = 'Falta RG';
    await clientesRepository.saveDetalhes(clienteDesatualizado!);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id },
    });

    expect(clienteOnDatabase).toEqual(
      expect.objectContaining({
        etapa: 'PROTOCOLO',
        movidoPorId: user.id,
        observacao: 'Falta RG',
      }),
    );
  });

  test('[save] - should not revert the andamento fields', async () => {
    const { id } = await prisma.cliente.create({
      data: {
        name: 'Terezinha Gomes',
        cpf: '40822359065',
        nb: '1339021146',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const clienteDesatualizado = await clientesRepository.findById(id);

    await prisma.cliente.update({
      where: { id },
      data: { etapa: 'CONCLUIDO', observacao: 'Protocolado' },
    });

    clienteDesatualizado!.arquivar();
    await clientesRepository.save(clienteDesatualizado!);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id },
    });

    expect(clienteOnDatabase).toEqual(
      expect.objectContaining({
        arquivada: true,
        etapa: 'CONCLUIDO',
        observacao: 'Protocolado',
      }),
    );
  });
});
