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

interface DistributionItem {
  label: string;
  level: 'low' | 'medium' | 'high';
  count: number;
  percentage: number;
}

interface RankedItem {
  name: string;
  count: number;
}

@Component({
  selector: 'app-risk-analysis',

  imports: [
    RouterLink,

    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    MetricCard,
    RiskBadge,
    PolicyBadge,
  ],

  templateUrl: './risk-analysis.html',
  styleUrl: './risk-analysis.scss',
})
export class RiskAnalysis {
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

  readonly lowRisk = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.risk_level === 'low',
        )
        .length,
  );

  readonly mediumRisk = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.risk_level === 'medium',
        )
        .length,
  );

  readonly highRisk = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.risk_level === 'high',
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

  readonly requiresReview = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.requires_review,
        )
        .length,
  );

  readonly breakingChanges = computed(
    () =>
      this.pullRequests()
        .filter(
          (pr) =>
            pr.breaking_change,
        )
        .length,
  );

  readonly averageScore = computed(() => {
    const scores =
      this.pullRequests()
        .map(
          (pr) => pr.risk_score,
        )
        .filter(
          (
            score,
          ): score is number =>
            typeof score === 'number',
        );

    if (!scores.length) {
      return '0.0';
    }

    const average =
      scores.reduce(
        (sum, score) =>
          sum + score,
        0,
      ) / scores.length;

    return average.toFixed(1);
  });

  readonly sensitiveFilesCount =
    computed(() => {
      const files = new Set<string>();

      for (
        const pr of this.pullRequests()
      ) {
        for (
          const file of
            pr.sensitive_files ?? []
        ) {
          files.add(file);
        }
      }

      return files.size;
    });

  readonly distribution =
    computed<DistributionItem[]>(() => {
      const total =
        this.total();

      const calculatePercentage = (
        count: number,
      ) =>
        total === 0
          ? 0
          : Math.round(
              (count / total) * 100,
            );

      return [
        {
          label: 'Low',
          level: 'low',
          count: this.lowRisk(),
          percentage:
            calculatePercentage(
              this.lowRisk(),
            ),
        },

        {
          label: 'Medium',
          level: 'medium',
          count: this.mediumRisk(),
          percentage:
            calculatePercentage(
              this.mediumRisk(),
            ),
        },

        {
          label: 'High',
          level: 'high',
          count: this.highRisk(),
          percentage:
            calculatePercentage(
              this.highRisk(),
            ),
        },
      ];
    });

  readonly topRiskPullRequests =
    computed(() => {
      const levelWeight:
        Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1,
      };

      return [
        ...this.pullRequests(),
      ]
        .sort((a, b) => {
          const scoreDifference =
            (b.risk_score ?? 0) -
            (a.risk_score ?? 0);

          if (scoreDifference !== 0) {
            return scoreDifference;
          }

          return (
            (levelWeight[
              b.risk_level ?? ''
            ] ?? 0) -
            (levelWeight[
              a.risk_level ?? ''
            ] ?? 0)
          );
        })
        .slice(0, 8);
    });

  readonly impactAreas =
    computed<RankedItem[]>(() => {
      const occurrences =
        new Map<string, number>();

      for (
        const pr of this.pullRequests()
      ) {
        for (
          const area of
            pr.impact_areas ?? []
        ) {
          occurrences.set(
            area,
            (
              occurrences.get(area)
              ?? 0
            ) + 1,
          );
        }
      }

      return [
        ...occurrences.entries(),
      ]
        .map(
          ([name, count]) => ({
            name,
            count,
          }),
        )
        .sort(
          (a, b) =>
            b.count - a.count,
        );
    });

  readonly sensitiveFiles =
    computed<RankedItem[]>(() => {
      const occurrences =
        new Map<string, number>();

      for (
        const pr of this.pullRequests()
      ) {
        for (
          const file of
            pr.sensitive_files ?? []
        ) {
          occurrences.set(
            file,
            (
              occurrences.get(file)
              ?? 0
            ) + 1,
          );
        }
      }

      return [
        ...occurrences.entries(),
      ]
        .map(
          ([name, count]) => ({
            name,
            count,
          }),
        )
        .sort(
          (a, b) =>
            b.count - a.count,
        )
        .slice(0, 10);
    });

  readonly attentionPercentage =
    computed(() => {
      if (!this.total()) {
        return 0;
      }

      return Math.round(
        (
          this.requiresReview()
          / this.total()
        ) * 100,
      );
    });

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
              firstPage.meta
                .totalPages <= 1
            ) {
              return of(
                firstPage.data,
              );
            }

            const remainingPages =
              Array.from(
                {
                  length:
                    firstPage.meta
                      .totalPages - 1,
                },
                (
                  _,
                  index,
                ) =>
                  this.api
                    .getPullRequests({
                      page:
                        index + 2,
                      limit: 100,
                    }),
              );

            return forkJoin(
              remainingPages,
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
            'Erro ao carregar análise de risco:',
            error,
          );

          this.error.set(
            'Não foi possível carregar a análise de risco.',
          );

          this.loading.set(false);
        },
      });
  }
}