import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  itens: any[] = [];
  carregando = true;
  finalizando = false;
  sucesso = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.carregando = true;
    this.apiService.getCart().subscribe({
      next: (res) => {
        this.itens = res.map((item: any) => ({ ...item, selecionado: true }));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSelecao(item: any): void {
    item.selecionado = !item.selecionado;
    this.cdr.detectChanges();
  }

  toggleSelecionarTodos(): void {
    const todosSelecionados = this.itens.every(i => i.selecionado);
    this.itens.forEach(i => i.selecionado = !todosSelecionados);
    this.cdr.detectChanges();
  }

  get todosSelecionados(): boolean {
    return this.itens.length > 0 && this.itens.every(i => i.selecionado);
  }

  aumentarQuantidade(item: any): void {
    item.quantity++;
    this.atualizarItem(item);
  }

  diminuirQuantidade(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.atualizarItem(item);
    }
  }

  atualizarItem(item: any): void {
    this.apiService.updateCartItem(item.id, item).subscribe({
      next: () => {
        this.cdr.detectChanges();
      }
    });
  }

  removerItem(item: any): void {
    if (!confirm(`Remover "${item.title}" do carrinho?`)) return;

    this.apiService.removeFromCart(item.id).subscribe({
      next: () => {
        this.itens = this.itens.filter(i => i.id !== item.id);
        this.cdr.detectChanges();
      }
    });
  }

  get itensSelecionados(): any[] {
    return this.itens.filter(i => i.selecionado);
  }

  get subtotal(): number {
    return this.itensSelecionados.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  get totalItensSelecionados(): number {
    return this.itensSelecionados.reduce((acc, item) => acc + item.quantity, 0);
  }

  finalizarCompra(): void {
    if (this.itensSelecionados.length === 0) return;

    this.finalizando = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const idsParaRemover = this.itensSelecionados.map(i => i.id);

      const remocoes = idsParaRemover.map(id => this.apiService.removeFromCart(id));

      Promise.all(remocoes.map(obs => new Promise(resolve => obs.subscribe({ next: resolve, error: resolve }))))
        .then(() => {
          this.itens = this.itens.filter(i => !idsParaRemover.includes(i.id));
          this.finalizando = false;
          this.sucesso = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.sucesso = false;
            this.cdr.detectChanges();
          }, 3000);
        });
    }, 1200);
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}