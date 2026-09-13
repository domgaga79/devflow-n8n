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
  GithubEvent,
  GithubEventsResponse,
} from '../models/github-event.model';

import {
  GithubEventsApiService,
} from './github-events-api.service';

describe(
  'GithubEventsApiService',
  () => {
    let service:
      GithubEventsApiService;

    let httpTesting:
      HttpTestingController;

    const baseUrl =
      'http://localhost:3000/api';

    const mockEvent:
      GithubEvent = {
      id: '61',

      delivery_id:
        'delivery-test',

      event_type:
        'push',

      action: null,

      repository_full_name:
        'domgaga79/devflow-n8n',

      sender_login:
        'domgaga79',

      issue_number:
        null,

      issue_title:
        null,

      issue_url:
        null,

      classification:
        'other',

      priority:
        'normal',

      payload: {
        ref:
          'refs/heads/main',
      },

      received_at:
        '2026-09-13T15:00:00.000Z',
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
          GithubEventsApiService,
        );

      httpTesting =
        TestBed.inject(
          HttpTestingController,
        );
    });

    afterEach(() => {
      httpTesting.verify();
    });

    it('deve listar GitHub Events com filtros e paginação', () => {
      const response:
        GithubEventsResponse = {
        data: [
          mockEvent,
        ],

        meta: {
          page: 1,
          limit: 20,
          total: 29,
          totalPages: 2,

          hasNextPage:
            true,

          hasPreviousPage:
            false,
        },

        filters: {
          repository:
            'domgaga79/devflow-n8n',

          eventType:
            'push',

          action: null,

          classification:
            null,

          priority:
            null,
        },
      };

      service
        .getEvents({
          page: 1,
          limit: 20,

          repository:
            'domgaga79/devflow-n8n',

          eventType:
            'push',
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
              ===
              `${baseUrl}/github-events`
            && req.params.get(
              'page',
            )
              === '1'
            && req.params.get(
              'limit',
            )
              === '20'
            && req.params.get(
              'repository',
            )
              ===
              'domgaga79/devflow-n8n'
            && req.params.get(
              'eventType',
            )
              === 'push',
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush(
        response,
      );
    });

    it('deve carregar um evento individual pelo ID', () => {
      service
        .getEvent('61')
        .subscribe(
          (result) => {
            expect(result)
              .toEqual(
                mockEvent,
              );
          },
        );

      const request =
        httpTesting.expectOne(
          `${baseUrl}/github-events/61`,
        );

      expect(
        request.request.method,
      ).toBe('GET');

      request.flush(
        mockEvent,
      );
    });
  },
);