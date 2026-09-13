import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { HealthController } from './health.controller.js';

import type { PrismaService } from '../prisma/prisma.service.js';

describe('HealthController', () => {
  it('deve retornar status ok quando o banco responder', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([
        {
          ok: 1,
        },
      ]),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    const result = await controller.health();

    expect(result).toMatchObject({
      status: 'ok',
      service: 'DevFlow API',
      database: 'connected',
    });

    expect(result.timestamp).toBeDefined();

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro 503 quando o banco falhar', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockRejectedValue(
        new Error('Database unavailable'),
      ),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    await expect(
      controller.health(),
    ).rejects.toMatchObject({
      status: 503,
    });
  });
});