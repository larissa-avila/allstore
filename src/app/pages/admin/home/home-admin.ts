import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css'
})
export class HomeAdmin implements OnInit {
  // Dados
  dummyProducts: any[] = [];
  localProducts: any[] = [];
  allProducts: any[] = [];
  myProducts: any[] = [];
  categories: any[] = [];

  // Filtros
  filteredProducts: any[] = [];
  paginatedProducts: any[] = [];
  selectedCategory = '';
  searchQuery = '';

  // Paginação
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Estado
  carregando = true;
  abaAtiva: 'todos' | 'meus' = 'todos';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.carregando = true;

    this.apiService.getProducts().subscribe({
      next: (res) => {
        this.dummyProducts = res.products;
        this.loadLocalProducts();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLocalProducts(): void {
    this.apiService.getLocalProducts().subscribe({
      next: (res) => {
        this.localProducts = res.map((p: any) => ({ ...p, isLocal: true }));
        this.myProducts = this.localProducts.filter(
          p => p.userId === this.getUser()?.id
        );
        this.allProducts = [...this.dummyProducts, ...this.localProducts];
        this.applyFilters();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.allProducts = [...this.dummyProducts];
        this.applyFilters();
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

  mudarAba(aba: 'todos' | 'meus'): void {
    this.abaAtiva = aba;
    this.currentPage = 1;
    this.searchQuery = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.currentPage = 1;
    if (this.selectedCategory === category) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = category;
    }
    this.applyFilters();
  }

  search(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let source = this.abaAtiva === 'todos' ? this.allProducts : this.myProducts;

    if (this.selectedCategory) {
      source = source.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      source = source.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    this.filteredProducts = source;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  editProduct(id: number): void {
    this.router.navigate(['/admin/add-product', id]);
  }

  deleteProduct(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    this.apiService.deleteProduct(id).subscribe({
      next: () => {
        this.loadLocalProducts();
      }
    });
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
}