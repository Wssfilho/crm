import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('FetchUsuariosController (E2E)', () => {
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

  test('[GET] /usuarios - should list the office users', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric@advocacia.com.br',
        password: '123456',
      },
    });

    await prisma.user.create({
      data: {
        name: 'Ana Protocolo',
        email: 'ana@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.usuarios).toEqual([
      expect.objectContaining({ name: 'Ana Protocolo' }),
      expect.objectContaining({ name: 'Eric Melo', id: user.id }),
    ]);
    expect(response.body.usuarios[0]).not.toHaveProperty('password');
  });
});
