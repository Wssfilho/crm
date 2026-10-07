import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('EditProfileController (E2E)', () => {
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

  test('[PATCH] /me - should edit the authenticated user profile', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Eric Melo Santos', email: 'contato@advocacia.com.br' });

    expect(response.status).toBe(200);

    const userOnDatabase = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(userOnDatabase).toEqual(
      expect.objectContaining({
        name: 'Eric Melo Santos',
        email: 'contato@advocacia.com.br',
      }),
    );
  });

  test('[PATCH] /me - should not use an email from another user', async () => {
    await prisma.user.create({
      data: {
        name: 'Outro Usuário',
        email: 'ocupado@advocacia.com.br',
        password: '123456',
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric2@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Eric Melo', email: 'ocupado@advocacia.com.br' });

    expect(response.status).toBe(409);
  });
});
