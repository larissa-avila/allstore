import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogService } from './core/services/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialog],
  template: `
    <router-outlet />
    <app-confirm-dialog #confirmDialog />
  `,
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialog;

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngAfterViewInit(): void {
    this.confirmDialogService.registerDialog(this.confirmDialog);
  }
}