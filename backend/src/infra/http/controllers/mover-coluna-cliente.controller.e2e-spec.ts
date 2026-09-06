import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('MoverColunaClienteController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwt = moduleRef.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PATCH] /clientes/:clienteId/coluna - should move a cliente to another column', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Maria da Silva',
        cpf: '12345678909',
        nb: '1234567890',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}/coluna`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        coluna: 'DOCS',
      });

    expect(response.status).toBe(200);
    expect(response.body.cliente).toEqual(
      expect.objectContaining({
        id: cliente.id,
        coluna: 'DOCS',
      }),
    );

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase?.coluna).toBe('DOCS');
  });
});
