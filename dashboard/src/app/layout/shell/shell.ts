import {
  Component,
  HostListener,
  signal,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import {
  MatIconModule,
} from '@angular/material/icon';

@Component({
  selector: 'app-shell',

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
  ],

  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly mobileMenuOpen =
    signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(
      (open) => !open,
    );
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  @HostListener(
    'document:keydown.escape',
  )
  onEscape(): void {
    this.closeMobileMenu();
  }
}