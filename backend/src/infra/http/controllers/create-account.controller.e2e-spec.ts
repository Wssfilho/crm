import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('CreateAccountController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);

    await app.init();
  });

  test('[POST] /accounts - should create a new account', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Eric Melo',
      email: 'eric@advocacia.com.br',
      password: 'senha123',
    });

    expect(response.status).toBe(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: { email: 'eric@advocacia.com.br' },
    });

    expect(userOnDatabase).toBeTruthy();
  });

  test('[POST] /accounts - should not create an account with a duplicated email', async () => {
    await request(app.getHttpServer()).post('/accounts').send({
      name: 'Eric Melo',
      email: 'duplicado@advocacia.com.br',
      password: 'senha123',
    });

    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Outro Eric',
      email: 'duplicado@advocacia.com.br',
      password: 'senha123',
    });

    expect(response.status).toBe(409);
  });
});
