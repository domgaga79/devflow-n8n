import {
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-risk-badge',

  templateUrl: './risk-badge.html',
  styleUrl: './risk-badge.scss',
})
export class RiskBadge {
  readonly level =
    input<string | null | undefined>();

  readonly normalizedLevel = computed(
    () =>
      this.level()
        ?.toLowerCase()
        .trim() || 'unknown',
  );
}