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
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  RouterLink,
} from '@angular/router';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatFormFieldModule,
} from '@angular/material/form-field';

import {
  MatIconModule,
} from '@angular/material/icon';

import {
  MatInputModule,
} from '@angular/material/input';

import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import {
  MatSelectModule,
} from '@angular/material/select';

import {
  MatTableModule,
} from '@angular/material/table';

import {
  PullRequestsApiService,
} from '../../core/services/pull-requests-api.service';

import {
  PullRequest,
  PullRequestsResponse,
} from '../../core/models/pull-request.model';

import {
  RiskBadge,
} from '../../shared/components/risk-badge/risk-badge';

import {
  PolicyBadge,
} from '../../shared/components/policy-badge/policy-badge';

@Component({
  selector: 'app-pull-requests',

  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,

    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,

    RiskBadge,
    PolicyBadge,
  ],

  templateUrl: './pull-requests.html',
  styleUrl: './pull-requests.scss',
})
export class PullRequests {
  private readonly api =
    inject(PullRequestsApiService);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly destroyRef =
    inject(DestroyRef);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly response =
    signal<PullRequestsResponse | null>(null);

  readonly displayedColumns = [
    'pr',
    'title',
    'state',
    'risk',
    'score',
    'policy',
    'updatedAt',
    'actions',
  ];

  readonly filterForm =
    this.formBuilder.nonNullable.group({
      repository: [''],
      state: [''],
      riskLevel: [''],
      policyStatus: [''],
    });

  readonly pageSize =
    signal(10);

  constructor() {
    this.load();
  }

  load(
    page = 1,
  ): void {
    const filters =
      this.filterForm.getRawValue();

    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPullRequests({
        page,
        limit: this.pageSize(),

        repository:
          filters.repository.trim() || undefined,

        state:
          filters.state || undefined,

        riskLevel:
          filters.riskLevel || undefined,

        policyStatus:
          filters.policyStatus || undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.response.set(response);
          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Erro ao carregar Pull Requests:',
            error,
          );

          this.error.set(
            'Não foi possível carregar os Pull Requests.',
          );

          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  clearFilters(): void {
    this.filterForm.reset({
      repository: '',
      state: '',
      riskLevel: '',
      policyStatus: '',
    });

    this.load(1);
  }

  previousPage(): void {
    const current =
      this.response();

    if (
      !current ||
      !current.meta.hasPreviousPage
    ) {
      return;
    }

    this.load(
      current.meta.page - 1,
    );
  }

  nextPage(): void {
    const current =
      this.response();

    if (
      !current ||
      !current.meta.hasNextPage
    ) {
      return;
    }

    this.load(
      current.meta.page + 1,
    );
  }

  trackById(
    _index: number,
    item: PullRequest,
  ): string {
    return item.id;
  }
}