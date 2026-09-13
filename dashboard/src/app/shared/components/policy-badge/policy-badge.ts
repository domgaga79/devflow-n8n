import {
  Component,
  computed,
  input,
} from '@angular/core';

import {
  MatIconModule,
} from '@angular/material/icon';

@Component({
  selector: 'app-policy-badge',

  imports: [
    MatIconModule,
  ],

  templateUrl: './policy-badge.html',
  styleUrl: './policy-badge.scss',
})
export class PolicyBadge {
  readonly status =
    input<string | null | undefined>();

  readonly normalizedStatus = computed(
    () =>
      this.status()
        ?.toLowerCase()
        .trim() || 'unknown',
  );

  readonly icon = computed(() => {
    switch (this.normalizedStatus()) {
      case 'passed':
        return 'check_circle';

      case 'blocked':
        return 'block';

      case 'review_required':
      case 'review-required':
      case 'review':
        return 'rate_review';

      default:
        return 'help_outline';
    }
  });
}