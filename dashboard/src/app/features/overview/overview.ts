import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  DatePipe,
} from '@angular/common';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  MatIconModule,
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  DashboardApiService,
} from '../../core/services/dashboard-api.service';

import {
  DashboardSummary,
} from '../../core/models/dashboard.model';

import {
  MetricCard,
} from '../../shared/components/metric-card/metric-card';

@Component({
  selector: 'app-overview',

  imports: [
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MetricCard,
  ],

  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  private readonly dashboardApi =
    inject(DashboardApiService);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly summary =
    signal<DashboardSummary | null>(null);

  readonly loading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardApi
      .getSummary()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (summary) => {
          this.summary.set(summary);
          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Erro ao carregar dashboard:',
            error,
          );

          this.error.set(
            'Não foi possível carregar os indicadores do DevFlow.',
          );

          this.loading.set(false);
        },
      });
  }
}