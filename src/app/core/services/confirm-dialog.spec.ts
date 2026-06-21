import { Injectable } from '@angular/core';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogRef?: ConfirmDialog;

  registerDialog(dialog: ConfirmDialog): void {
    this.dialogRef = dialog;
  }

  confirm(config: {
    titulo?: string;
    mensagem: string;
    textoConfirmar?: string;
    textoCancelar?: string;
    tipo?: 'danger' | 'default';
  }): Promise<boolean> {
    if (!this.dialogRef) {
      return Promise.resolve(confirm(config.mensagem));
    }
    return this.dialogRef.abrir(config);
  }
}