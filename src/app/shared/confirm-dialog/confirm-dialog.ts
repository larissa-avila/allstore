import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  visivel = false;
  titulo = 'Confirmar ação';
  mensagem = '';
  textoConfirmar = 'Confirmar';
  textoCancelar = 'Cancelar';
  tipo: 'danger' | 'default' = 'default';

  private resolvePromise?: (value: boolean) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  abrir(config: {
    titulo?: string;
    mensagem: string;
    textoConfirmar?: string;
    textoCancelar?: string;
    tipo?: 'danger' | 'default';
  }): Promise<boolean> {
    this.titulo = config.titulo || 'Confirmar ação';
    this.mensagem = config.mensagem;
    this.textoConfirmar = config.textoConfirmar || 'Confirmar';
    this.textoCancelar = config.textoCancelar || 'Cancelar';
    this.tipo = config.tipo || 'default';
    this.visivel = true;
    this.cdr.detectChanges();

    return new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }

  confirmar(): void {
    this.visivel = false;
    this.cdr.detectChanges();
    this.resolvePromise?.(true);
  }

  cancelar(): void {
    this.visivel = false;
    this.cdr.detectChanges();
    this.resolvePromise?.(false);
  }
}