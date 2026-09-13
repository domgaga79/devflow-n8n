import {
  Component,
  inject,
} from '@angular/core';

import {
  Clipboard,
  ClipboardModule,
} from '@angular/cdk/clipboard';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatIconModule,
} from '@angular/material/icon';

import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import {
  GithubEvent,
} from '../../../core/models/github-event.model';

interface PayloadDialogData {
  event: GithubEvent;
}

@Component({
  selector: 'app-github-event-payload-dialog',

  imports: [
    ClipboardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
  ],

  templateUrl:
    './github-event-payload-dialog.html',

  styleUrl:
    './github-event-payload-dialog.scss',
})
export class GithubEventPayloadDialog {
  readonly data =
    inject<PayloadDialogData>(
      MAT_DIALOG_DATA,
    );

  private readonly clipboard =
    inject(Clipboard);

  private readonly snackBar =
    inject(MatSnackBar);

  readonly formattedPayload =
    JSON.stringify(
      this.data.event.payload ?? {},
      null,
      2,
    );

  copyPayload(): void {
    const copied =
      this.clipboard.copy(
        this.formattedPayload,
      );

    this.snackBar.open(
      copied
        ? 'Payload copiado.'
        : 'Não foi possível copiar o payload.',
      'Fechar',
      {
        duration: 2500,
      },
    );
  }
}