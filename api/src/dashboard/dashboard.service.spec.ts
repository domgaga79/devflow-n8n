import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { DashboardService } from './dashboard.service.js';

import type { PrismaService } from '../prisma/prisma.service.js';

describe('DashboardService', () => {
  const pullRequestsCount = vi.fn();
  const githubEventsCount = vi.fn();
  const analysisCount = vi.fn();
  const analysisFindMany = vi.fn();

  const prisma = {
    pull_requests: {
      count: pullRequestsCount,
    },

    github_events: {
      count: githubEventsCount,
    },

    pr_analysis_history: {
      count: analysisCount,
      findMany: analysisFindMany,
    },
  } as unknown as PrismaService;

  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new DashboardService(prisma);
  });

  it('deve gerar resumo do dashboard', async () => {
    pullRequestsCount
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(3);

    githubEventsCount.mockResolvedValue(25);

    analysisCount.mockResolvedValue(18);

    analysisFindMany.mockResolvedValue([
      {
        id: 1n,
        pr_number: 8,
        risk_level: 'high',
        risk_score: 12,
        policy_status: 'blocked',
      },
    ]);

    const result = await service.summary();

    expect(result.pullRequests).toEqual({
      total: 10,
      open: 3,
      closed: 7,
      merged: 2,
      requiresReview: 4,
    });

    expect(result.policy).toEqual({
      passed: 5,
      reviewRequired: 2,
      blocked: 3,
    });

    expect(result.risk).toEqual({
      low: 4,
      medium: 3,
      high: 3,
    });

    expect(result.events).toEqual({
      github: 25,
      analyses: 18,
    });

    expect(result.latestAnalyses).toHaveLength(1);

    expect(result.generatedAt).toBeDefined();
  });
});