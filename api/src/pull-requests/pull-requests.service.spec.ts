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
  PullRequestsService,
} from './pull-requests.service.js';

describe('PullRequestsService', () => {
  let service: PullRequestsService;

  const pullRequestsFindMany = vi.fn();
  const pullRequestsCount = vi.fn();
  const historyFindMany = vi.fn();

  const prisma = {
    pull_requests: {
      findMany: pullRequestsFindMany,
      count: pullRequestsCount,
    },

    pr_analysis_history: {
      findMany: historyFindMany,
    },
  } as unknown as PrismaService;

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

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PullRequestsService(prisma);
  });

  describe('findAll', () => {
    it('deve usar paginacao e filtros informados', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);
      pullRequestsCount.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        repository: 'domgaga79/devflow-n8n',
        riskLevel: 'high',
      });

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: {
          repository_full_name:
            'domgaga79/devflow-n8n',
          risk_level: 'high',
        },
        orderBy: {
          updated_at: 'desc',
        },
        skip: 0,
        take: 10,
      });

      expect(
        pullRequestsCount,
      ).toHaveBeenCalledWith({
        where: {
          repository_full_name:
            'domgaga79/devflow-n8n',
          risk_level: 'high',
        },
      });

      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(result.filters).toEqual({
        repository:
          'domgaga79/devflow-n8n',
        state: null,
        riskLevel: 'high',
        policyStatus: null,
      });

      expect(result.data).toEqual([
        samplePullRequest,
      ]);
    });

    it('deve usar page 1 e limit 20 quando nao forem informados', async () => {
      pullRequestsFindMany.mockResolvedValue([]);
      pullRequestsCount.mockResolvedValue(25);

      const result =
        await service.findAll({});

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          updated_at: 'desc',
        },
        skip: 0,
        take: 20,
      });

      expect(
        pullRequestsCount,
      ).toHaveBeenCalledWith({
        where: {},
      });

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
        state: null,
        riskLevel: null,
        policyStatus: null,
      });
    });

    it('deve aplicar todos os filtros disponiveis', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);
      pullRequestsCount.mockResolvedValue(21);

      const result = await service.findAll({
        page: 2,
        limit: 10,
        repository:
          'domgaga79/devflow-n8n',
        state: 'closed',
        riskLevel: 'high',
        policyStatus: 'blocked',
      });

      const expectedWhere = {
        repository_full_name:
          'domgaga79/devflow-n8n',
        state: 'closed',
        risk_level: 'high',
        policy_status: 'blocked',
      };

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: {
          updated_at: 'desc',
        },
        skip: 10,
        take: 10,
      });

      expect(
        pullRequestsCount,
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
        repository:
          'domgaga79/devflow-n8n',
        state: 'closed',
        riskLevel: 'high',
        policyStatus: 'blocked',
      });
    });

    it('deve identificar a ultima pagina', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);
      pullRequestsCount.mockResolvedValue(21);

      const result = await service.findAll({
        page: 3,
        limit: 10,
      });

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          updated_at: 'desc',
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

    it('deve retornar totalPages zero quando nao houver PRs', async () => {
      pullRequestsFindMany.mockResolvedValue([]);
      pullRequestsCount.mockResolvedValue(0);

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
    it('deve encontrar PR quando repository for informado', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);

      const result = await service.findOne(
        8,
        'domgaga79/devflow-n8n',
      );

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: {
          pr_number: 8,
          repository_full_name:
            'domgaga79/devflow-n8n',
        },
        orderBy: {
          updated_at: 'desc',
        },
        take: 1,
      });

      expect(result).toEqual(
        samplePullRequest,
      );
    });

    it('deve encontrar PR unico sem repository', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);

      const result =
        await service.findOne(8);

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: {
          pr_number: 8,
        },
        orderBy: {
          updated_at: 'desc',
        },
        take: 2,
      });

      expect(result).toEqual(
        samplePullRequest,
      );
    });

    it('deve retornar NotFoundException com repository', async () => {
      pullRequestsFindMany.mockResolvedValue([]);

      await expect(
        service.findOne(
          999,
          'domgaga79/devflow-n8n',
        ),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve retornar NotFoundException sem repository', async () => {
      pullRequestsFindMany.mockResolvedValue([]);

      await expect(
        service.findOne(999),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve exigir repository quando houver mais de um PR com mesmo numero', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
        {
          ...samplePullRequest,
          id: 31n,
          repository_full_name:
            'exemplo/outro-repositorio',
        },
      ]);

      await expect(
        service.findOne(8),
      ).rejects.toBeInstanceOf(
        BadRequestException,
      );

      await expect(
        service.findOne(8),
      ).rejects.toThrow(
        /Existe mais de um PR #8/,
      );
    });
  });

  describe('history', () => {
    it('deve retornar historico usando repository informado', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);

      const historyItem = {
        id: 1n,
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

      historyFindMany.mockResolvedValue([
        historyItem,
      ]);

      const result =
        await service.history(
          8,
          'domgaga79/devflow-n8n',
        );

      expect(result.total).toBe(1);

      expect(result.pullRequest).toEqual({
        repository:
          'domgaga79/devflow-n8n',
        number: 8,
        title:
          'Test DevFlow PR Risk Lifecycle 2',
        state: 'closed',
      });

      expect(result.history).toEqual([
        historyItem,
      ]);

      expect(
        historyFindMany,
      ).toHaveBeenCalledWith({
        where: {
          pr_number: 8,
          repository_full_name:
            'domgaga79/devflow-n8n',
        },
        orderBy: {
          evaluated_at: 'desc',
        },
      });
    });

    it('deve retornar historico sem repository quando o PR for unico', async () => {
      pullRequestsFindMany.mockResolvedValue([
        samplePullRequest,
      ]);

      historyFindMany.mockResolvedValue([]);

      const result =
        await service.history(8);

      expect(
        pullRequestsFindMany,
      ).toHaveBeenCalledWith({
        where: {
          pr_number: 8,
        },
        orderBy: {
          updated_at: 'desc',
        },
        take: 2,
      });

      expect(
        historyFindMany,
      ).toHaveBeenCalledWith({
        where: {
          pr_number: 8,
          repository_full_name:
            'domgaga79/devflow-n8n',
        },
        orderBy: {
          evaluated_at: 'desc',
        },
      });

      expect(result.total).toBe(0);
      expect(result.history).toEqual([]);
    });
  });
});