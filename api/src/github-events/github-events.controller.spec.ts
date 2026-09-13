import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  GithubEventsController,
} from './github-events.controller.js';

import type {
  GithubEventsService,
} from './github-events.service.js';

describe('GithubEventsController', () => {
  let controller: GithubEventsController;

  const findAll = vi.fn();
  const findOne = vi.fn();

  const service = {
    findAll,
    findOne,
  } as unknown as GithubEventsService;

  beforeEach(() => {
    vi.clearAllMocks();

    controller =
      new GithubEventsController(
        service,
      );
  });

  it('deve delegar a listagem para GithubEventsService', async () => {
    const query = {
      page: 2,
      limit: 10,
      repository:
        'domgaga79/devflow-n8n',
      eventType:
        'pull_request',
      action:
        'closed',
      classification:
        'security',
      priority:
        'high',
    };

    const expected = {
      data: [],
      meta: {
        page: 2,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: true,
      },
      filters: {
        repository:
          'domgaga79/devflow-n8n',
        eventType:
          'pull_request',
        action:
          'closed',
        classification:
          'security',
        priority:
          'high',
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

  it('deve delegar a busca por ID para GithubEventsService', async () => {
    const event = {
      id: 61n,
      event_type: 'push',
      repository_full_name:
        'domgaga79/devflow-n8n',
    };

    findOne.mockResolvedValue(
      event,
    );

    const result =
      await controller.findOne(
        '61',
      );

    expect(findOne).toHaveBeenCalledTimes(
      1,
    );

    expect(findOne).toHaveBeenCalledWith(
      '61',
    );

    expect(result).toEqual(
      event,
    );
  });
});
