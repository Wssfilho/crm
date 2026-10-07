import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('FetchUsersController (E2E)', () => {
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

  test('[GET] /users - should list users for an admin', async () => {
    const { token } = await signInAs('ADMIN', 'admin@advocacia.com.br');

    await signInAs('USER', 'usuario@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0]).not.toHaveProperty('password');
  });

  test('[GET] /users - should not list users for a common user', async () => {
    const { token } = await signInAs('USER', 'comum@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
