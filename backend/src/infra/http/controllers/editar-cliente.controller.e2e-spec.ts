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

  test('[PATCH] /clientes/:clienteId - should reject a link that is not http or https', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Elisa Comercial',
        email: 'elisa@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Lúcia Helena',
        cpf: '45011780350',
        nb: '1510084427',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ driveUrl: 'javascript:alert(1)' });

    expect(response.status).toBe(400);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase?.driveUrl).toBeNull();
  });

  test('[PATCH] /clientes/:clienteId - should edit the cadastro and clear optional fields', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Fábio Comercial',
        email: 'fabio@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Raimundo Nonato',
        cpf: '317.905.226-09',
        nb: '1294407718',
        telefone: '(73) 98888-0000',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Raimundo Nonato da Silva',
        nascimento: '1952-05-20',
        telefone: null,
        municipio: 'Itabuna-BA',
        especie: '41',
        rendaEmCentavos: 151800,
      });

    expect(response.status).toBe(200);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase).toEqual(
      expect.objectContaining({
        name: 'Raimundo Nonato da Silva',
        cpf: '317.905.226-09',
        nascimento: new Date('1952-05-20'),
        telefone: null,
        municipio: 'Itabuna-BA',
        especie: '41',
        rendaEmCentavos: 151800,
      }),
    );
  });

  test('[PATCH] /clientes/:clienteId - should return 409 for the cpf of another cliente', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Gabi Comercial',
        email: 'gabi@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    await prisma.cliente.create({
      data: {
        name: 'Edson Ferreira',
        cpf: '208.554.331-67',
        nb: '1346602213',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Geralda Nunes',
        cpf: '188.402.771-70',
        nb: '1261148805',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cpf: '208.554.331-67' });

    expect(response.status).toBe(409);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase?.cpf).toBe('188.402.771-70');
  });

  test('[PATCH] /clientes/:clienteId - should reject an invalid cpf', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Hugo Comercial',
        email: 'hugo@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const cliente = await prisma.cliente.create({
      data: {
        name: 'Manoel dos Reis',
        cpf: '221.640.877-80',
        nb: '1407712204',
        status: 'PENDENTE',
        coluna: 'NOVO',
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/clientes/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cpf: '111.111.111-11', name: 'X' });

    expect(response.status).toBe(400);

    const clienteOnDatabase = await prisma.cliente.findUnique({
      where: { id: cliente.id },
    });

    expect(clienteOnDatabase?.cpf).toBe('221.640.877-80');
  });
});
