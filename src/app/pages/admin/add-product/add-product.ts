import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css'
})
export class AddProduct implements OnInit {
  categories: any[] = [];
  salvando = false;
  sucesso = false;
  erro = '';

  produto = {
    title: '',
    category: '',
    description: '',
    price: null as number | null,
    imageUrl: ''
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.cdr.detectChanges();
      }
    });
  }

  get imagePreview(): string {
    return this.produto.imageUrl || 'https://placehold.co/300x300?text=Sem+Imagem';
  }

  salvar(): void {
    this.erro = '';

    if (!this.produto.title || !this.produto.category || !this.produto.price) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      this.cdr.detectChanges();
      return;
    }

    if (this.produto.price <= 0) {
      this.erro = 'O preço deve ser maior que zero.';
      this.cdr.detectChanges();
      return;
    }

    this.salvando = true;
    this.cdr.detectChanges();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const novoProduto = {
      title: this.produto.title,
      category: this.produto.category,
      description: this.produto.description,
      price: this.produto.price,
      thumbnail: this.produto.imageUrl || 'https://placehold.co/300x300?text=Sem+Imagem',
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    this.apiService.addProduct(novoProduto).subscribe({
      next: () => {
        this.salvando = false;
        this.sucesso = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1500);
      },
      error: () => {
        this.erro = 'Erro ao salvar produto. Tente novamente.';
        this.salvando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin']);
  }
}