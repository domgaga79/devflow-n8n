import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  API_BASE_URL,
} from '../config/api.config';

import {
  DashboardSummary,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl =
    inject(API_BASE_URL);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${this.apiBaseUrl}/dashboard/summary`,
    );
  }
}