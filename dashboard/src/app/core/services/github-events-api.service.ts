import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  API_BASE_URL,
} from '../config/api.config';

import {
  GithubEvent,
  GithubEventsQuery,
  GithubEventsResponse,
} from '../models/github-event.model';

@Injectable({
  providedIn: 'root',
})
export class GithubEventsApiService {
  private readonly http =
    inject(HttpClient);

  private readonly apiBaseUrl =
    inject(API_BASE_URL);

  getEvents(
    query: GithubEventsQuery = {},
  ): Observable<GithubEventsResponse> {
    let params =
      new HttpParams();

    if (query.page !== undefined) {
      params = params.set(
        'page',
        query.page.toString(),
      );
    }

    if (query.limit !== undefined) {
      params = params.set(
        'limit',
        query.limit.toString(),
      );
    }

    if (query.repository) {
      params = params.set(
        'repository',
        query.repository,
      );
    }

    if (query.eventType) {
      params = params.set(
        'eventType',
        query.eventType,
      );
    }

    if (query.action) {
      params = params.set(
        'action',
        query.action,
      );
    }

    if (query.classification) {
      params = params.set(
        'classification',
        query.classification,
      );
    }

    if (query.priority) {
      params = params.set(
        'priority',
        query.priority,
      );
    }

    return this.http.get<GithubEventsResponse>(
      `${this.apiBaseUrl}/github-events`,
      {
        params,
      },
    );
  }

  getEvent(
    id: string,
  ): Observable<GithubEvent> {
    return this.http.get<GithubEvent>(
      `${this.apiBaseUrl}/github-events/${id}`,
    );
  }
}