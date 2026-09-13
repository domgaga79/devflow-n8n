import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  DatePipe,
} from '@angular/common';

import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  forkJoin,
} from 'rxjs';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatIconModule,
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import {
  PullRequest,
  PullRequestHistoryResponse,
} from '../../core/models/pull-request.model';

import {
  PullRequestsApiService,
} from '../../core/services/pull-requests-api.service';

import {
  PolicyBadge,
} from '../../shared/components/policy-badge/policy-badge';

import {
  RiskBadge,
} from '../../shared/components/risk-badge/risk-badge';

@Component({
  selector: 'app-pull-request-details',

  imports: [
    DatePipe,
    RouterLink,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    RiskBadge,
    PolicyBadge,
  ],

  templateUrl: './pull-request-details.html',
  styleUrl: './pull-request-details.scss',
})
export class PullRequestDetails {
  private readonly route =
    inject(ActivatedRoute);

  private readonly api =
    inject(PullRequestsApiService);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly pullRequest =
    signal<PullRequest | null>(null);

  readonly history =
    signal<PullRequestHistoryResponse | null>(
      null,
    );

  readonly loading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  readonly historyAscending = computed(() => {
    const items =
      this.history()?.history ?? [];

    return [...items].reverse();
  });

  readonly number =
    Number(
      this.route.snapshot.paramMap.get(
        'number',
      ),
    );

  readonly repository =
    this.route.snapshot.queryParamMap.get(
      'repository',
    ) ?? undefined;

  constructor() {
    this.load();
  }

  load(): void {
    if (
      !Number.isInteger(this.number)
      || this.number <= 0
    ) {
      this.error.set(
        'Número do Pull Request inválido.',
      );

      this.loading.set(false);

      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      pullRequest:
        this.api.getPullRequest(
          this.number,
          this.repository,
        ),

      history:
        this.api.getHistory(
          this.number,
          this.repository,
        ),
    })
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: ({
          pullRequest,
          history,
        }) => {
          this.pullRequest.set(
            pullRequest,
          );

          this.history.set(
            history,
          );

          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Erro ao carregar detalhes do PR:',
            error,
          );

          this.error.set(
            'Não foi possível carregar os detalhes deste Pull Request.',
          );

          this.loading.set(false);
        },
      });
  }

  severityClass(
    severity?: string | null,
  ): string {
    switch (
      severity
        ?.toLowerCase()
        .trim()
    ) {
      case 'critical':
        return 'check--critical';

      case 'warning':
        return 'check--warning';

      default:
        return 'check--info';
    }
  }

  policyCheckIcon(
    passed?: boolean,
  ): string {
    if (passed === true) {
      return 'check_circle';
    }

    if (passed === false) {
      return 'cancel';
    }

    return 'info';
  }
}