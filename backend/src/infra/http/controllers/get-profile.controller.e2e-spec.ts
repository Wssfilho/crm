import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/prisma/prisma.service';

describe('GetProfileController (E2E)', () => {
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

  test('[GET] /me - should return the authenticated user profile', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Eric Melo',
        email: 'eric@advocacia.com.br',
        password: '123456',
      },
    });

    const token = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(
      expect.objectContaining({ email: 'eric@advocacia.com.br' }),
    );
  });

  test('[GET] /me - should not return the profile without a token', async () => {
    const response = await request(app.getHttpServer()).get('/me');

    expect(response.status).toBe(401);
  });
});
