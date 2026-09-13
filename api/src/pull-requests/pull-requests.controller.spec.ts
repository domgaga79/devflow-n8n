import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  PullRequestsController,
} from './pull-requests.controller.js';

import type {
  PullRequestsService,
} from './pull-requests.service.js';

describe('PullRequestsController', () => {
  let controller:
    PullRequestsController;

  const findAll = vi.fn();
  const findOne = vi.fn();
  const history = vi.fn();

  const service = {
    findAll,
    findOne,
    history,
  } as unknown as PullRequestsService;

  beforeEach(() => {
    vi.clearAllMocks();

    controller =
      new PullRequestsController(
        service,
      );
  });

  it('deve delegar a listagem para PullRequestsService', async () => {
    const query = {
      page: 2,
      limit: 10,
      repository:
        'domgaga79/devflow-n8n',
      riskLevel:
        'high',
    };

    const expected = {
      data: [
        {
          id: 30n,
          pr_number: 8,
          repository_full_name:
            'domgaga79/devflow-n8n',
          risk_level: 'high',
        },
      ],

      meta: {
        page: 2,
        limit: 10,
        total: 11,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    };

    findAll.mockResolvedValue(
      expected,
    );

    const result =
      await controller.findAll(
        query,
      );

    expect(findAll).toHaveBeenCalledTimes(
      1,
    );

    expect(findAll).toHaveBeenCalledWith(
      query,
    );

    expect(result).toEqual(
      expected,
    );
  });

  it('deve delegar a busca de detalhes com repository', async () => {
    const expected = {
      id: 30n,
      pr_number: 8,
      repository_full_name:
        'domgaga79/devflow-n8n',
      title:
        'Test DevFlow PR Risk Lifecycle 2',
    };

    findOne.mockResolvedValue(
      expected,
    );

    const result =
      await controller.findOne(
        8,
        'domgaga79/devflow-n8n',
      );

    expect(findOne).toHaveBeenCalledTimes(
      1,
    );

    expect(findOne).toHaveBeenCalledWith(
      8,
      'domgaga79/devflow-n8n',
    );

    expect(result).toEqual(
      expected,
    );
  });

  it('deve encaminhar repository indefinido na busca de detalhes', async () => {
    const expected = {
      id: 30n,
      pr_number: 8,
    };

    findOne.mockResolvedValue(
      expected,
    );

    const result =
      await controller.findOne(
        8,
      );

    expect(findOne).toHaveBeenCalledWith(
      8,
      undefined,
    );

    expect(result).toEqual(
      expected,
    );
  });

  it('deve delegar a consulta de histórico com repository', async () => {
    const expected = {
      pullRequest: {
        repository:
          'domgaga79/devflow-n8n',
        number: 8,
        title:
          'Test DevFlow PR Risk Lifecycle 2',
        state: 'closed',
      },

      total: 1,

      history: [
        {
          id: 1n,
          risk_level: 'high',
          risk_score: 12,
          policy_status: 'blocked',
        },
      ],
    };

    history.mockResolvedValue(
      expected,
    );

    const result =
      await controller.history(
        8,
        'domgaga79/devflow-n8n',
      );

    expect(history).toHaveBeenCalledTimes(
      1,
    );

    expect(history).toHaveBeenCalledWith(
      8,
      'domgaga79/devflow-n8n',
    );

    expect(result).toEqual(
      expected,
    );
  });

  it('deve encaminhar repository indefinido na consulta de histórico', async () => {
    const expected = {
      pullRequest: {
        number: 8,
      },
      total: 0,
      history: [],
    };

    history.mockResolvedValue(
      expected,
    );

    const result =
      await controller.history(
        8,
      );

    expect(history).toHaveBeenCalledWith(
      8,
      undefined,
    );

    expect(result).toEqual(
      expected,
    );
  });
});
