import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { compare, hash } from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('ChangePasswordController (E2E)', () => {
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

  test('[PATCH] /me/password - should change the user password', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric@advocacia.com.br',
        password: await hash('senha123', 8),
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .patch('/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'senha123', newPassword: 'nova-senha' });

    expect(response.status).toBe(204);

    const userOnDatabase = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(await compare('nova-senha', userOnDatabase.password)).toBe(true);
  });

  test('[PATCH] /me/password - should not change with a wrong current password', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Outro Eric',
        email: 'outro@advocacia.com.br',
        password: await hash('senha123', 8),
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .patch('/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'senha-errada', newPassword: 'nova-senha' });

    expect(response.status).toBe(400);
  });
});
