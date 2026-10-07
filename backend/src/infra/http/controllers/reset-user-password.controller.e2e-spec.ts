import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { compare } from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('ResetUserPasswordController (E2E)', () => {
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

  async function signInAs(role: 'ADMIN' | 'USER', email: string) {
    const user = await prisma.user.create({
      data: { name: 'Usuário Teste', email, password: '123456', role },
    });

    return { user, token: jwt.sign({ sub: user.id }) };
  }

  test('[PATCH] /users/:userId/password - should reset the user password', async () => {
    const { token } = await signInAs('ADMIN', 'admin@advocacia.com.br');
    const { user } = await signInAs('USER', 'usuario@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'senha-provisoria' });

    expect(response.status).toBe(204);

    const userOnDatabase = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(await compare('senha-provisoria', userOnDatabase.password)).toBe(
      true,
    );
  });

  test('[PATCH] /users/:userId/password - should not reset as a common user', async () => {
    const { token } = await signInAs('USER', 'comum@advocacia.com.br');
    const { user } = await signInAs('USER', 'outro@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'senha-provisoria' });

    expect(response.status).toBe(403);
  });
});
