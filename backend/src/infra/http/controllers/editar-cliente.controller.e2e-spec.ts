import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('EditarClienteController (E2E)', () => {
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

  test('[PATCH] /clientes/:clienteId - should edit drive link, note and responsavel', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Bruno Comercial',
        email: 'bruno@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'José Raimundo',
        cpf: '04231876517',
        nb: '1284567890',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        driveUrl: 'https://drive.google.com/drive/folders/abc',
        observacao: 'Falta RG',
        responsavelId: user.id,
      });

    expect(response.status).toBe(200);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase).toEqual(
      expect.objectContaining({
        driveUrl: 'https://drive.google.com/drive/folders/abc',
        observacao: 'Falta RG',
        responsavelId: user.id,
      }),
    );
  });

  test('[PATCH] /clientes/:clienteId - should clear a field when null is sent', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Carla Protocolo',
        email: 'carla@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Terezinha Gomes',
        cpf: '40822359065',
        nb: '1339021146',
        status: 'PENDENTE',
        coluna: 'NOVO',
        observacao: 'Falta RG',
        driveUrl: 'https://drive.google.com/drive/folders/xyz',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ observacao: null });

    expect(response.status).toBe(200);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase?.observacao).toBeNull();
    expect(clienteOnDatabase?.driveUrl).toBe(
      'https://drive.google.com/drive/folders/xyz',
    );
  });

  test('[PATCH] /clientes/:clienteId - should return 404 for an unknown responsavel', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Diego Comercial',
        email: 'diego@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Antônio Carlos',
        cpf: '33014567825',
        nb: '1315524009',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ responsavelId: '6f1c1f9e-6d2a-4c3e-9b2a-1f2e3d4c5b6a' });

    expect(response.status).toBe(404);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase?.responsavelId).toBeNull();
  });
});
