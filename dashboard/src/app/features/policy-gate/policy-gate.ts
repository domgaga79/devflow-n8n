import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  RouterLink,
} from '@angular/router';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  forkJoin,
  map,
  of,
  switchMap,
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
} from '../../core/models/pull-request.model';

import {
  PullRequestsApiService,
} from '../../core/services/pull-requests-api.service';

import {
  MetricCard,
} from '../../shared/components/metric-card/metric-card';

import {
  PolicyBadge,
} from '../../shared/components/policy-badge/policy-badge';

import {
  RiskBadge,
} from '../../shared/components/risk-badge/risk-badge';

interface PolicyRuleStats {
  name: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  critical: number;
}

@Component({
  selector: 'app-policy-gate',

  imports: [
    RouterLink,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    MetricCard,
    PolicyBadge,
    RiskBadge,
  ],

  templateUrl: './policy-gate.html',
  styleUrl: './policy-gate.scss',
})
export class PolicyGate {
  private readonly api =
    inject(PullRequestsApiService);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly loading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  readonly pullRequests =
    signal<PullRequest[]>([]);

  readonly total = computed(
    () => this.pullRequests().length,
  );

  readonly passed = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.policy_status === 'passed',
        )
        .length,
  );

  readonly blocked = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.policy_status === 'blocked',
        )
        .length,
  );

  readonly reviewRequired = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.policy_status === 'review_required'
            || pr.requires_review,
        )
        .length,
  );

  readonly totalChecks = computed(
    () =>
      this.pullRequests()
        .reduce(
          (total, pr) =>
            total
            + (
              pr.policy_checks?.length
              ?? 0
            ),
          0,
        ),
  );

  readonly failedChecks = computed(
    () =>
      this.pullRequests()
        .reduce(
          (total, pr) =>
            total
            + (
              pr.policy_checks
                ?.filter(
                  (check) =>
                    check.passed === false,
                )
                .length
              ?? 0
            ),
          0,
        ),
  );

  readonly passRate = computed(() => {
    if (!this.total()) {
      return 0;
    }

    return Math.round(
      (
        this.passed()
        / this.total()
      ) * 100,
    );
  });

  readonly rules = computed<
    PolicyRuleStats[]
  >(() => {
    const ruleMap =
      new Map<
        string,
        PolicyRuleStats
      >();

    for (
      const pr of this.pullRequests()
    ) {
      for (
        const check of
          pr.policy_checks ?? []
      ) {
        const current =
          ruleMap.get(check.check)
          ?? {
            name: check.check,
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            critical: 0,
          };

        current.total += 1;

        if (check.passed === true) {
          current.passed += 1;
        }

        if (check.passed === false) {
          current.failed += 1;
        }

        if (
          check.severity
            ?.toLowerCase()
            === 'warning'
        ) {
          current.warnings += 1;
        }

        if (
          check.severity
            ?.toLowerCase()
            === 'critical'
        ) {
          current.critical += 1;
        }

        ruleMap.set(
          check.check,
          current,
        );
      }
    }

    return [
      ...ruleMap.values(),
    ].sort(
      (a, b) =>
        b.failed - a.failed
        || b.critical - a.critical
        || b.warnings - a.warnings,
    );
  });

  readonly attentionQueue =
    computed(() =>
      [
        ...this.pullRequests(),
      ]
        .filter(
          (pr) =>
            pr.policy_status === 'blocked'
            || pr.requires_review,
        )
        .sort(
          (a, b) =>
            (b.risk_score ?? 0)
            - (a.risk_score ?? 0),
        ),
    );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPullRequests({
        page: 1,
        limit: 100,
      })
      .pipe(
        switchMap(
          (firstPage) => {
            if (
              firstPage.meta.totalPages
              <= 1
            ) {
              return of(
                firstPage.data,
              );
            }

            const requests =
              Array.from(
                {
                  length:
                    firstPage.meta
                      .totalPages - 1,
                },
                (_, index) =>
                  this.api
                    .getPullRequests({
                      page:
                        index + 2,
                      limit: 100,
                    }),
              );

            return forkJoin(
              requests,
            ).pipe(
              map(
                (pages) => [
                  ...firstPage.data,

                  ...pages.flatMap(
                    (page) =>
                      page.data,
                  ),
                ],
              ),
            );
          },
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: (pullRequests) => {
          this.pullRequests.set(
            pullRequests,
          );

          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Erro ao carregar Policy Gate:',
            error,
          );

          this.error.set(
            'Não foi possível carregar os dados do Policy Gate.',
          );

          this.loading.set(false);
        },
      });
  }

  humanizeRule(
    value: string,
  ): string {
    return value
      .replaceAll('_', ' ')
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  }
}