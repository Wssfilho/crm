import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('DeleteUserController (E2E)', () => {
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

  test('[DELETE] /users/:userId - should delete a user', async () => {
    const { token } = await signInAs('ADMIN', 'admin@advocacia.com.br');
    const { user } = await signInAs('USER', 'usuario@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const userOnDatabase = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(userOnDatabase).toBeNull();
  });

  test('[DELETE] /users/:userId - should not delete the own account', async () => {
    const { user, token } = await signInAs('ADMIN', 'proprio@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
