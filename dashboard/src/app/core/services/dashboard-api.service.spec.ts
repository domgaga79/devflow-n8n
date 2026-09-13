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
  describe,
  beforeEach,
  afterEach,
  expect,
  it,
} from 'vitest';

import {
  DashboardApiService,
} from './dashboard-api.service';

import {
  API_BASE_URL,
} from '../config/api.config';

import {
  DashboardSummary,
} from '../models/dashboard.model';

describe('DashboardApiService', () => {
  let service: DashboardApiService;

  let httpTesting:
    HttpTestingController;

  const baseUrl =
    'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),

        {
          provide: API_BASE_URL,
          useValue: baseUrl,
        },
      ],
    });

    service =
      TestBed.inject(
        DashboardApiService,
      );

    httpTesting =
      TestBed.inject(
        HttpTestingController,
      );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve buscar o resumo do dashboard', () => {
    const mockResponse:
      DashboardSummary = {
      pullRequests: {
        total: 2,
        open: 0,
        closed: 2,
        merged: 1,
        requiresReview: 1,
      },

      policy: {
        passed: 1,
        reviewRequired: 0,
        blocked: 1,
      },

      risk: {
        low: 1,
        medium: 0,
        high: 1,
      },

      events: {
        github: 29,
        analyses: 6,
      },

      latestAnalyses: [],

      generatedAt:
        '2026-09-13T15:00:00.000Z',
    };

    service
      .getSummary()
      .subscribe(
        (response) => {
          expect(response)
            .toEqual(mockResponse);
        },
      );

    const request =
      httpTesting.expectOne(
        `${baseUrl}/dashboard/summary`,
      );

    expect(
      request.request.method,
    ).toBe('GET');

    request.flush(
      mockResponse,
    );
  });
});