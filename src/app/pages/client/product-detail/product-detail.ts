import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  produto: any = null;
  carregando = true;
  imagemAtiva = '';
  quantidade = 1;
  adicionando = false;
  cartCount = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    }
    this.loadCartCount();
  }

  loadProduct(id: number): void {
    this.carregando = true;
    this.apiService.getProductById(id).subscribe({
      next: (res) => {
        this.produto = res;
        this.imagemAtiva = res.images?.[0] || res.thumbnail;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCartCount(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

this.apiService.getCart(user.id).subscribe({
      next: (res) => {
        this.cartCount = res.length;
        this.cdr.detectChanges();
      }
    });
  }

  selecionarImagem(img: string): void {
    this.imagemAtiva = img;
    this.cdr.detectChanges();
  }

  aumentarQuantidade(): void {
    this.quantidade++;
    this.cdr.detectChanges();
  }

  diminuirQuantidade(): void {
    if (this.quantidade > 1) {
      this.quantidade--;
      this.cdr.detectChanges();
    }
  }

  adicionarAoCarrinho(): void {
    this.adicionando = true;
    this.cdr.detectChanges();

    const item = {
      productId: this.produto.id,
      title: this.produto.title,
      price: this.produto.price,
      thumbnail: this.produto.thumbnail
    };

    this.apiService.addOrUpdateCart(this.produto.id, item, this.quantidade).subscribe({
      next: () => {
        this.loadCartCount();
        this.adicionando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.adicionando = false;
        this.cdr.detectChanges();
      }
    });
  }

  comprarAgora(): void {
    alert('Compra fictícia realizada com sucesso! (funcionalidade ilustrativa)');
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}