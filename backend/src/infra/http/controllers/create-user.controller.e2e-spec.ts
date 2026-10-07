import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('CreateUserController (E2E)', () => {
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

  test('[POST] /users - should create a user with the given role', async () => {
    const { token } = await signInAs('ADMIN', 'admin@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Mariana Souza',
        email: 'mariana@advocacia.com.br',
        password: '123456',
        role: 'ADMIN',
      });

    expect(response.status).toBe(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: { email: 'mariana@advocacia.com.br' },
    });

    expect(userOnDatabase?.role).toBe('ADMIN');
  });

  test('[POST] /users - should not create a user as a common user', async () => {
    const { token } = await signInAs('USER', 'comum@advocacia.com.br');

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Intruso',
        email: 'intruso@advocacia.com.br',
        password: '123456',
        role: 'ADMIN',
      });

    expect(response.status).toBe(403);
  });
});
