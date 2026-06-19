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
  isEdicao = false;
  produtoOriginal: any = null;

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
        this.categoriasFiltradas = res;
      }
    });

    // Recebe produto via navegação (state)
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { produto: any };

    if (state?.produto) {
      this.isEdicao = true;
      this.produtoOriginal = state.produto;
      this.produto = {
        title: state.produto.title || '',
        category: state.produto.category || '',
        description: state.produto.description || '',
        price: state.produto.price || null,
        imageUrl: state.produto.thumbnail || ''
      };
    }
  }

  get imagePreview(): string {
    return this.produto.imageUrl || 'https://placehold.co/300x300?text=Sem+Imagem';
  }

  get tituloPagina(): string {
    return this.isEdicao ? 'Editar Produto' : 'Cadastrar Novo Produto';
  }

  get subtituloPagina(): string {
    return this.isEdicao ? 'Altere as informações do produto' : 'Preencha as informações do produto';
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

    const produtoData: any = {
      title: this.produto.title,
      category: this.produto.category,
      description: this.produto.description,
      price: this.produto.price,
      thumbnail: this.produto.imageUrl || 'https://placehold.co/300x300?text=Sem+Imagem',
      userId: user.id,
      deleted: false,
      updatedAt: new Date().toISOString()
    };

    if (this.isEdicao && this.produtoOriginal) {
      if (this.produtoOriginal.isLocal) {
        // Editar produto que já está no JSON Server
        produtoData.originalId = this.produtoOriginal.originalId ?? null;
        this.apiService.updateProduct(this.produtoOriginal.id, produtoData).subscribe({
          next: () => this.onSucesso(),
          error: () => this.onErro()
        });
      } else {
        // Editar produto da API: salva no JSON Server com originalId
        produtoData.originalId = this.produtoOriginal.id;
        this.apiService.addProduct(produtoData).subscribe({
          next: () => this.onSucesso(),
          error: () => this.onErro()
        });
      }
    } else {
      // Novo produto
      produtoData.createdAt = new Date().toISOString();
      this.apiService.addProduct(produtoData).subscribe({
        next: () => this.onSucesso(),
        error: () => this.onErro()
      });
    }
  }

  onSucesso(): void {
    this.salvando = false;
    this.sucesso = true;
    this.cdr.detectChanges();
    setTimeout(() => this.router.navigate(['/admin']), 1500);
  }

  onErro(): void {
    this.erro = 'Erro ao salvar produto. Tente novamente.';
    this.salvando = false;
    this.cdr.detectChanges();
  }

  cancelar(): void {
    this.router.navigate(['/admin']);
  }

  dropdownAberto = false;
  categoriaSearch = '';
  categoriasFiltradas: any[] = [];

  toggleDropdown(): void {
    this.dropdownAberto = !this.dropdownAberto;
    if (this.dropdownAberto) {
      this.categoriasFiltradas = this.categories;
    }
    this.cdr.detectChanges();
  }

  filterCategories(): void {
    const query = this.categoriaSearch.toLowerCase();
    this.categoriasFiltradas = this.categories.filter((c: any) =>
      c.name.toLowerCase().includes(query)
    );
    this.cdr.detectChanges();
  }

  selectCategory(slug: string): void {
    this.produto.category = slug;
    this.dropdownAberto = false;
    this.categoriaSearch = '';
    this.cdr.detectChanges();
  }

  getCategoryName(): string {
    const cat = this.categories.find((c: any) => c.slug === this.produto.category);
    return cat ? cat.name : '';
  }
}