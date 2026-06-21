import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css'
})
export class HomeAdmin implements OnInit {
  allProducts: any[] = [];
  localProducts: any[] = [];
  categories: any[] = [];
  filteredProducts: any[] = [];
  paginatedProducts: any[] = [];
  selectedCategory = '';
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  carregando = true;
  menuAberto = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.carregando = true;
    this.apiService.getProducts().subscribe({
      next: (apiProducts) => {
        this.apiService.getLocalProducts().subscribe({
          next: (localProducts) => {
            this.localProducts = localProducts;

            // IDs deletados ou editados no JSON Server
            const deletedIds = localProducts.filter((p: any) => p.deleted).map((p: any) => p.originalId ?? p.id);
            const editedMap = new Map(localProducts.filter((p: any) => !p.deleted && p.originalId).map((p: any) => [p.originalId, p]));

            // Produtos da API: remove deletados, substitui editados
            let result = apiProducts.products
              .filter((p: any) => !deletedIds.includes(p.id))
              .map((p: any) => {
                if (editedMap.has(p.id)) {
                  const edited = editedMap.get(p.id) as any;
                  return { ...edited, isLocal: true };
                }
                return p;
              });

            // Adiciona produtos novos do JSON Server (sem originalId e sem deleted)
            const newProducts = localProducts.filter((p: any) => !p.originalId && !p.deleted).map((p: any) => ({ ...p, isLocal: true }));

            this.allProducts = [...result, ...newProducts];
            this.applyFilters();
            this.carregando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.allProducts = apiProducts.products;
            this.applyFilters();
            this.carregando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(category: string): void {
    this.currentPage = 1;

    this.selectedCategory =
      this.selectedCategory === category ? '' : category;

    this.applyFilters();

    this.menuAberto = false;
    document.body.style.overflow = '';

    this.cdr.detectChanges();
  }

  closeMenu(): void {
    this.menuAberto = false;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  search(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.allProducts;

    if (this.selectedCategory) {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    this.filteredProducts = result;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.updatePagination();
    this.cdr.detectChanges();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  getPages(): Array<number | string> {

    const pages: (number | string)[] = [];

    if (this.totalPages <= 5) {
      return Array.from(
        { length: this.totalPages },
        (_, i) => i + 1
      );
    }

    pages.push(1);

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(
      this.totalPages - 1,
      this.currentPage + 1
    );

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages - 1) {
      pages.push('...');
    }

    pages.push(this.totalPages);

    return pages;
  }

  editProduct(produto: any): void {
    this.router.navigate(['/admin/add-product'], { state: { produto } });
  }

  async deleteProduct(produto: any): Promise<void> {
    const confirmado = await this.confirmDialogService.confirm({
      titulo: 'Excluir produto',
      mensagem: `Tem certeza que deseja excluir "${produto.title}"? Esta ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
      tipo: 'danger'
    });

    if (!confirmado) return;

    if (produto.isLocal) {
      const localItem = this.localProducts.find(p => p.originalId === produto.id || p.id === produto.id);
      if (localItem) {
        this.apiService.updateProduct(localItem.id, { ...localItem, deleted: true }).subscribe({
          next: () => this.loadAllProducts()
        });
      }
    } else {
      this.apiService.addProduct({ originalId: produto.id, deleted: true }).subscribe({
        next: () => this.loadAllProducts()
      });
    }
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;

    if (this.menuAberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    this.cdr.detectChanges();
  }

  goToAddProduct(): void {
    this.router.navigate(['/admin/add-product']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUser(): any {
    return this.authService.getUser();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.menuAberto) {
      this.closeMenu();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}