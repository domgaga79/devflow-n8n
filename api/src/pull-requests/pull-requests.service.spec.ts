import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { PullRequestsService } from './pull-requests.service.js';

import type { PrismaService } from '../prisma/prisma.service.js';

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
    repository_full_name: 'domgaga79/devflow-n8n',
    pr_number: 8,
    title: 'Test DevFlow PR Risk Lifecycle 2',
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

  it('deve listar pull requests com paginação e filtros', async () => {
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

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(result.data).toHaveLength(1);

    expect(result.data[0].pr_number).toBe(8);
  });

  it('deve retornar erro quando o PR não existir', async () => {
    pullRequestsFindMany.mockResolvedValue([]);

    await expect(
      service.findOne(
        999,
        'domgaga79/devflow-n8n',
      ),
    ).rejects.toThrow(
      'PR #999 não encontrado em domgaga79/devflow-n8n.',
    );
  });

  it('deve exigir repository quando houver PRs com mesmo número', async () => {
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
    ).rejects.toThrow(
      'Existe mais de um PR #8',
    );
  });

  it('deve retornar histórico de análise do PR', async () => {
    pullRequestsFindMany.mockResolvedValue([
      samplePullRequest,
    ]);

    historyFindMany.mockResolvedValue([
      {
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
      },
    ]);

    const result = await service.history(
      8,
      'domgaga79/devflow-n8n',
    );

    expect(result.total).toBe(1);

    expect(result.pullRequest).toEqual({
      repository: 'domgaga79/devflow-n8n',
      number: 8,
      title: 'Test DevFlow PR Risk Lifecycle 2',
      state: 'closed',
    });

    expect(historyFindMany).toHaveBeenCalledWith({
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
});