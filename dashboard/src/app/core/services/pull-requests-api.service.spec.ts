import {
  TestBed,
} from '@angular/core/testing';

import {
  provideHttpClient,
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  API_BASE_URL,
} from '../config/api.config';

import {
  PullRequest,
  PullRequestHistoryResponse,
  PullRequestsResponse,
} from '../models/pull-request.model';

import {
  PullRequestsApiService,
} from './pull-requests-api.service';

describe(
  'PullRequestsApiService',
  () => {
    let service:
      PullRequestsApiService;

    let httpTesting:
      HttpTestingController;

    const baseUrl =
      'http://localhost:3000/api';

    const mockPullRequest:
      PullRequest = {
      id: '30',

      repository_full_name:
        'domgaga79/devflow-n8n',

      pr_number: 8,

      state: 'closed',

      title:
        'Test DevFlow PR Risk Lifecycle 2',

      draft: false,
      merged: false,

      commits: 3,
      changed_files: 3,
      additions: 21,
      deletions: 0,

      updated_at:
        '2026-09-12T13:36:44.284Z',

      risk_level: 'high',
      risk_score: 12,

      breaking_change: true,

      requires_review: true,

      policy_status: 'blocked',
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),

          {
            provide:
              API_BASE_URL,

            useValue:
              baseUrl,
          },
        ],
      });

      service =
        TestBed.inject(
          PullRequestsApiService,
        );

      httpTesting =
        TestBed.inject(
          HttpTestingController,
        );
    });

    afterEach(() => {
      httpTesting.verify();
    });

    it('deve listar PRs com filtros', () => {
      const response:
        PullRequestsResponse = {
        data: [
          mockPullRequest,
        ],

        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },

        filters: {
          repository:
            'domgaga79/devflow-n8n',

          state: null,

          riskLevel:
            'high',

          policyStatus:
            null,
        },
      };

      service
        .getPullRequests({
          page: 1,
          limit: 10,

          repository:
            'domgaga79/devflow-n8n',

          riskLevel:
            'high',
        })
        .subscribe(
          (result) => {
            expect(result)
              .toEqual(response);
          },
        );

      const request =
        httpTesting.expectOne(
          (req) =>
            req.url
              === `${baseUrl}/pull-requests`
            && req.params.get('page')
              === '1'
            && req.params.get('limit')
              === '10'
            && req.params.get(
              'repository',
            )
              ===
              'domgaga79/devflow-n8n'
            && req.params.get(
              'riskLevel',
            )
              === 'high',
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush(
        response,
      );
    });

    it('deve buscar detalhes de um PR', () => {
      service
        .getPullRequest(
          8,
          'domgaga79/devflow-n8n',
        )
        .subscribe(
          (result) => {
            expect(result)
              .toEqual(
                mockPullRequest,
              );
          },
        );

      const request =
        httpTesting.expectOne(
          (req) =>
            req.url
              ===
              `${baseUrl}/pull-requests/8`
            && req.params.get(
              'repository',
            )
              ===
              'domgaga79/devflow-n8n',
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush(
        mockPullRequest,
      );
    });

    it('deve buscar histórico de um PR', () => {
      const response:
        PullRequestHistoryResponse = {
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
            id: '1',

            repository_full_name:
              'domgaga79/devflow-n8n',

            pr_number: 8,

            risk_level:
              'high',

            risk_score: 12,

            breaking_change:
              true,

            policy_status:
              'blocked',

            requires_review:
              true,

            evaluated_at:
              '2026-09-12T13:36:44.045Z',
          },
        ],
      };

      service
        .getHistory(
          8,
          'domgaga79/devflow-n8n',
        )
        .subscribe(
          (result) => {
            expect(result)
              .toEqual(response);
          },
        );

      const request =
        httpTesting.expectOne(
          (req) =>
            req.url
              ===
              `${baseUrl}/pull-requests/8/history`
            && req.params.get(
              'repository',
            )
              ===
              'domgaga79/devflow-n8n',
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush(
        response,
      );
    });
  },
);