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
  PullRequest,
  PullRequestHistoryResponse,
  PullRequestsQuery,
  PullRequestsResponse,
} from '../models/pull-request.model';

@Injectable({
  providedIn: 'root',
})
export class PullRequestsApiService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl =
    inject(API_BASE_URL);

  getPullRequests(
    query: PullRequestsQuery = {},
  ): Observable<PullRequestsResponse> {
    let params = new HttpParams();

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

    if (query.state) {
      params = params.set(
        'state',
        query.state,
      );
    }

    if (query.riskLevel) {
      params = params.set(
        'riskLevel',
        query.riskLevel,
      );
    }

    if (query.policyStatus) {
      params = params.set(
        'policyStatus',
        query.policyStatus,
      );
    }

    return this.http.get<PullRequestsResponse>(
      `${this.apiBaseUrl}/pull-requests`,
      {
        params,
      },
    );
  }

  getPullRequest(
    number: number,
    repository?: string,
  ): Observable<PullRequest> {
    let params = new HttpParams();

    if (repository) {
      params = params.set(
        'repository',
        repository,
      );
    }

    return this.http.get<PullRequest>(
      `${this.apiBaseUrl}/pull-requests/${number}`,
      {
        params,
      },
    );
  }

  getHistory(
    number: number,
    repository?: string,
  ): Observable<PullRequestHistoryResponse> {
    let params = new HttpParams();

    if (repository) {
      params = params.set(
        'repository',
        repository,
      );
    }

    return this.http.get<PullRequestHistoryResponse>(
      `${this.apiBaseUrl}/pull-requests/${number}/history`,
      {
        params,
      },
    );
  }
}