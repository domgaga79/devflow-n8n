import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  DashboardController,
} from './dashboard.controller.js';

import type {
  DashboardService,
} from './dashboard.service.js';

describe('DashboardController', () => {
  let controller: DashboardController;

  const summary = vi.fn();

  const service = {
    summary,
  } as unknown as DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();

    controller =
      new DashboardController(
        service,
      );
  });

  it('deve delegar o resumo para DashboardService', async () => {
    const expected = {
      pullRequests: {
        total: 10,
        open: 3,
        closed: 7,
      },

      risk: {
        low: 4,
        medium: 3,
        high: 3,
      },

      policy: {
        passed: 6,
        reviewRequired: 2,
        blocked: 2,
      },
    };

    summary.mockResolvedValue(
      expected,
    );

    const result =
      await controller.summary();

    expect(summary).toHaveBeenCalledTimes(
      1,
    );

    expect(result).toEqual(
      expected,
    );
  });
});
