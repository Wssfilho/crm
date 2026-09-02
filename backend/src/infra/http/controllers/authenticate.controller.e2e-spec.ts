import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('AuthenticateController (E2E)', () => {
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

  test('[POST] /sessions - should authenticate and return an access token', async () => {
    await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric@advocacia.com.br',
        password: await hash('senha123', 8),
      },
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'eric@advocacia.com.br',
      password: 'senha123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });

  test('[POST] /sessions - should not authenticate with a wrong password', async () => {
    await prisma.user.create({
      data: {
        name: 'Outro Eric',
        email: 'outro@advocacia.com.br',
        password: await hash('senha123', 8),
      },
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'outro@advocacia.com.br',
      password: 'senha-errada',
    });

    expect(response.status).toBe(401);
  });
});
