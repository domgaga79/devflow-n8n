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
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';

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
  GithubEvent,
  GithubEventsResponse,
} from '../../core/models/github-event.model';

import {
  GithubEventsApiService,
} from '../../core/services/github-events-api.service';

import {
  MetricCard,
} from '../../shared/components/metric-card/metric-card';

import {
  GithubEventPayloadDialog,
} from './payload-dialog/github-event-payload-dialog';

@Component({
  selector: 'app-github-events',

  imports: [
    DatePipe,
    ReactiveFormsModule,

    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,

    MetricCard,
  ],

  templateUrl: './github-events.html',
  styleUrl: './github-events.scss',
})
export class GithubEvents {
  private readonly api =
    inject(GithubEventsApiService);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly dialog =
    inject(MatDialog);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly response =
    signal<GithubEventsResponse | null>(
      null,
    );

  readonly payloadLoadingId =
    signal<string | null>(null);

  readonly pageSize =
    signal(20);

  readonly displayedColumns = [
    'event',
    'subject',
    'repository',
    'classification',
    'priority',
    'receivedAt',
    'actions',
  ];

  readonly filterForm =
    this.formBuilder.nonNullable.group({
      repository: [''],
      eventType: [''],
      action: [''],
      classification: [''],
      priority: [''],
      limit: [20],
    });

  readonly pageItems = computed(
    () =>
      this.response()?.data ?? [],
  );

  readonly classifiedOnPage =
    computed(
      () =>
        this.pageItems().filter(
          (event) =>
            Boolean(
              event.classification,
            ),
        ).length,
    );

  readonly prioritizedOnPage =
    computed(
      () =>
        this.pageItems().filter(
          (event) =>
            Boolean(event.priority),
        ).length,
    );

  readonly issueEventsOnPage =
    computed(
      () =>
        this.pageItems().filter(
          (event) =>
            event.event_type
              .toLowerCase()
              === 'issues',
        ).length,
    );

  constructor() {
    this.load();
  }

  load(
    page = 1,
  ): void {
    const filters =
      this.filterForm.getRawValue();

    this.pageSize.set(
      Number(filters.limit) || 20,
    );

    this.loading.set(true);
    this.error.set(null);

    this.api
      .getEvents({
        page,
        limit: this.pageSize(),

        repository:
          filters.repository.trim()
          || undefined,

        eventType:
          filters.eventType.trim()
          || undefined,

        action:
          filters.action.trim()
          || undefined,

        classification:
          filters.classification.trim()
          || undefined,

        priority:
          filters.priority.trim()
          || undefined,
      })
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: (response) => {
          this.response.set(
            response,
          );

          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Erro ao carregar GitHub Events:',
            error,
          );

          this.error.set(
            'Não foi possível carregar os eventos recebidos do GitHub.',
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
      eventType: '',
      action: '',
      classification: '',
      priority: '',
      limit: 20,
    });

    this.pageSize.set(20);

    this.load(1);
  }

  previousPage(): void {
    const result =
      this.response();

    if (
      !result
      || !result.meta.hasPreviousPage
    ) {
      return;
    }

    this.load(
      result.meta.page - 1,
    );
  }

  nextPage(): void {
    const result =
      this.response();

    if (
      !result
      || !result.meta.hasNextPage
    ) {
      return;
    }

    this.load(
      result.meta.page + 1,
    );
  }

  openPayload(
    event: GithubEvent,
  ): void {
    this.payloadLoadingId.set(
      event.id,
    );

    this.api
      .getEvent(event.id)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: (fullEvent) => {
          this.payloadLoadingId.set(
            null,
          );

          this.dialog.open(
            GithubEventPayloadDialog,
            {
              data: {
                event: fullEvent,
              },

              width:
                'min(960px, 94vw)',

              maxWidth: '94vw',

              maxHeight: '88vh',

              autoFocus: false,
            },
          );
        },

        error: (error) => {
          console.error(
            'Erro ao carregar payload:',
            error,
          );

          this.payloadLoadingId.set(
            null,
          );

          this.error.set(
            `Não foi possível carregar o payload do evento #${event.id}.`,
          );
        },
      });
  }

  eventIcon(
    eventType: string,
  ): string {
    switch (
      eventType.toLowerCase()
    ) {
      case 'issues':
        return 'bug_report';

      case 'pull_request':
        return 'merge';

      case 'push':
        return 'commit';

      case 'workflow_run':
        return 'play_circle';

      default:
        return 'webhook';
    }
  }
}