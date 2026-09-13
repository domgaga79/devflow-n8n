import 'reflect-metadata';

import {
  ValidationPipe,
} from '@nestjs/common';

import type {
  INestApplication,
} from '@nestjs/common';

import {
  Test,
} from '@nestjs/testing';

import request from 'supertest';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AppModule } from '../src/app.module.js';
import { BigIntSerializerInterceptor } from '../src/common/bigint-serializer.interceptor.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('DevFlow API (e2e)', () => {
  let app: INestApplication;

  const samplePullRequest = {
    id: 30n,

    repository_full_name:
      'domgaga79/devflow-n8n',

    pr_number: 8,

    title:
      'Test DevFlow PR Risk Lifecycle 2',

    state: 'closed',

    risk_level: 'high',

    risk_score: 12,

    policy_status: 'blocked',

    requires_review: true,

    updated_at: new Date(
      '2026-09-12T13:36:44.284Z',
    ),
  };

  const sampleHistory = {
    id: 100n,

    repository_full_name:
      'domgaga79/devflow-n8n',

    pr_number: 8,

    risk_level: 'high',

    risk_score: 12,

    policy_status: 'blocked',

    evaluated_at: new Date(
      '2026-09-12T13:36:44.045Z',
    ),
  };

  const prismaMock = {
    $queryRaw: vi.fn().mockResolvedValue([
      {
        ok: 1,
      },
    ]),

    pull_requests: {
      findMany: vi.fn().mockImplementation(
        async () => [
          samplePullRequest,
        ],
      ),

      count: vi.fn().mockResolvedValue(1),
    },

    github_events: {
      count: vi.fn().mockResolvedValue(5),
    },

    pr_analysis_history: {
      count: vi.fn().mockResolvedValue(3),

      findMany: vi.fn().mockImplementation(
        async () => [
          sampleHistory,
        ],
      ),
    },
  };

  beforeAll(async () => {
    const moduleFixture =
      await Test.createTestingModule({
        imports: [
          AppModule,
        ],
      })
        .overrideProvider(PrismaService)
        .useValue(prismaMock)
        .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalInterceptors(
      new BigIntSerializerInterceptor(),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health deve retornar API saudável', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'DevFlow API',
      database: 'connected',
    });
  });

  it('GET /api/pull-requests deve listar PRs', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get(
        '/api/pull-requests?page=1&limit=10',
      )
      .expect(200);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
    });

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0]).toMatchObject({
      id: '30',
      pr_number: 8,
      risk_level: 'high',
      policy_status: 'blocked',
    });
  });

  it('deve rejeitar paginação inválida', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get(
        '/api/pull-requests?page=abc',
      )
      .expect(400);

    expect(response.body.statusCode).toBe(400);
  });

  it('deve rejeitar parâmetro não permitido', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get(
        '/api/pull-requests?hack=123',
      )
      .expect(400);

    expect(response.body.message).toContain(
      'property hack should not exist',
    );
  });

  it('GET /api/pull-requests/:number deve retornar um PR', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get(
        '/api/pull-requests/8?repository=domgaga79/devflow-n8n',
      )
      .expect(200);

    expect(response.body).toMatchObject({
      id: '30',
      pr_number: 8,
      repository_full_name:
        'domgaga79/devflow-n8n',
    });
  });

  it('GET /api/pull-requests/:number/history deve retornar histórico', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get(
        '/api/pull-requests/8/history?repository=domgaga79/devflow-n8n',
      )
      .expect(200);

    expect(response.body.total).toBe(1);

    expect(response.body.history[0]).toMatchObject({
      id: '100',
      pr_number: 8,
      risk_level: 'high',
    });
  });

  it('GET /api/dashboard/summary deve retornar indicadores', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/api/dashboard/summary')
      .expect(200);

    expect(response.body).toHaveProperty(
      'pullRequests',
    );

    expect(response.body).toHaveProperty(
      'policy',
    );

    expect(response.body).toHaveProperty(
      'risk',
    );

    expect(response.body).toHaveProperty(
      'events',
    );
  });
});