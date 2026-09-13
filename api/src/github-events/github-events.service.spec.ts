import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  GithubEventsService,
} from './github-events.service.js';

describe('GithubEventsService', () => {
  let service: GithubEventsService;

  const githubEventsFindMany = vi.fn();
  const githubEventsCount = vi.fn();
  const githubEventsFindUnique = vi.fn();

  const prisma = {
    github_events: {
      findMany: githubEventsFindMany,
      count: githubEventsCount,
      findUnique: githubEventsFindUnique,
    },
  } as unknown as PrismaService;

  const sampleEvent = {
    id: 61n,
    delivery_id: 'delivery-61',
    event_type: 'push',
    action: null,
    repository_full_name: 'domgaga79/devflow-n8n',
    sender_login: 'domgaga79',
    issue_number: null,
    issue_title: null,
    issue_url: null,
    classification: 'other',
    priority: 'normal',
    payload: {
      ref: 'refs/heads/main',
    },
    received_at: new Date(
      '2026-09-13T15:00:00.000Z',
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new GithubEventsService(
      prisma,
    );
  });

  describe('findAll', () => {
    it('deve usar paginação padrão sem filtros', async () => {
      githubEventsFindMany.mockResolvedValue([
        sampleEvent,
      ]);

      githubEventsCount.mockResolvedValue(25);

      const result = await service.findAll({});

      expect(
        githubEventsFindMany,
      ).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          received_at: 'desc',
        },
        skip: 0,
        take: 20,
      });

      expect(
        githubEventsCount,
      ).toHaveBeenCalledWith({
        where: {},
      });

      expect(result.data).toEqual([
        sampleEvent,
      ]);

      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 25,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });

      expect(result.filters).toEqual({
        repository: null,
        eventType: null,
        action: null,
        classification: null,
        priority: null,
      });
    });

    it('deve aplicar todos os filtros informados', async () => {
      githubEventsFindMany.mockResolvedValue([
        sampleEvent,
      ]);

      githubEventsCount.mockResolvedValue(21);

      const result = await service.findAll({
        page: 2,
        limit: 10,
        repository: 'domgaga79/devflow-n8n',
        eventType: 'issues',
        action: 'opened',
        classification: 'security',
        priority: 'high',
      });

      const expectedWhere = {
        repository_full_name:
          'domgaga79/devflow-n8n',
        event_type: 'issues',
        action: 'opened',
        classification: 'security',
        priority: 'high',
      };

      expect(
        githubEventsFindMany,
      ).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: {
          received_at: 'desc',
        },
        skip: 10,
        take: 10,
      });

      expect(
        githubEventsCount,
      ).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });

      expect(result.filters).toEqual({
        repository: 'domgaga79/devflow-n8n',
        eventType: 'issues',
        action: 'opened',
        classification: 'security',
        priority: 'high',
      });
    });

    it('deve identificar a última página', async () => {
      githubEventsFindMany.mockResolvedValue([
        sampleEvent,
      ]);

      githubEventsCount.mockResolvedValue(21);

      const result = await service.findAll({
        page: 3,
        limit: 10,
      });

      expect(
        githubEventsFindMany,
      ).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          received_at: 'desc',
        },
        skip: 20,
        take: 10,
      });

      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('deve retornar paginação vazia quando não houver eventos', async () => {
      githubEventsFindMany.mockResolvedValue([]);

      githubEventsCount.mockResolvedValue(0);

      const result = await service.findAll({
        page: 1,
        limit: 20,
      });

      expect(result.data).toEqual([]);

      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe('findOne', () => {
    it('deve buscar evento por ID usando BigInt', async () => {
      githubEventsFindUnique.mockResolvedValue(
        sampleEvent,
      );

      const result = await service.findOne('61');

      expect(
        githubEventsFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: 61n,
        },
      });

      expect(result).toEqual(sampleEvent);
    });

    it('deve rejeitar ID não numérico', async () => {
      await expect(
        service.findOne('abc'),
      ).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(
        githubEventsFindUnique,
      ).not.toHaveBeenCalled();
    });

    it('deve rejeitar ID parcialmente numérico', async () => {
      await expect(
        service.findOne('61abc'),
      ).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(
        githubEventsFindUnique,
      ).not.toHaveBeenCalled();
    });

    it('deve retornar NotFoundException quando o evento não existir', async () => {
      githubEventsFindUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne('999'),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(
        githubEventsFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: 999n,
        },
      });
    });
  });
});
