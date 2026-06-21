import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  allProducts: any[] = [];
  categories: any[] = [];
  filteredProducts: any[] = [];
  paginatedProducts: any[] = [];
  selectedCategory = '';
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  carregando = true;
  menuAberto = false;
  cartCount = 0;

  @ViewChild('gridContainer') gridContainer!: ElementRef;
  private resizeObserver?: ResizeObserver;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadCartCount();
  }

  ngAfterViewInit(): void {
    this.calcularItemsPerPage();
    this.resizeObserver = new ResizeObserver(() => {
      this.calcularItemsPerPage();
    });
    if (this.gridContainer) {
      this.resizeObserver.observe(this.gridContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  calcularItemsPerPage(): void {
    if (!this.gridContainer) return;

    const containerWidth = this.gridContainer.nativeElement.offsetWidth;
    const containerHeight = window.innerHeight - 200;

    const cardMinWidth = 200;
    const cardHeight = 260;
    const gap = 16;

    const colunas = Math.max(1, Math.floor((containerWidth + gap) / (cardMinWidth + gap)));
    const linhas = Math.max(2, Math.floor((containerHeight + gap) / (cardHeight + gap)));

    const novoItemsPerPage = colunas * linhas;

    if (novoItemsPerPage !== this.itemsPerPage && novoItemsPerPage > 0) {
      this.itemsPerPage = novoItemsPerPage;
      this.currentPage = 1;
      this.updatePagination();
      this.cdr.detectChanges();
    }
  }

  loadProducts(): void {
    this.carregando = true;
    this.apiService.getProducts().subscribe({
      next: (res) => {
        this.allProducts = res.products;
        this.applyFilters();
        this.carregando = false;
        this.cdr.detectChanges();
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

  loadCartCount(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.apiService.getCart(user.id).subscribe({
      next: (res) => {
        this.cartCount = res.length;
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(category: string): void {
    this.currentPage = 1;
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
    this.closeMenu();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): Array<number | string> {
    const pages: (number | string)[] = [];

    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < this.totalPages - 1) pages.push('...');
    pages.push(this.totalPages);

    return pages;
  }

  goToProduct(produto: any): void {
    this.router.navigate(['/product', produto.id]);
  }

  addToCart(produto: any, event: Event): void {
    event.stopPropagation();

    const item = {
      productId: produto.id,
      title: produto.title,
      price: produto.price,
      thumbnail: produto.thumbnail
    };

    this.apiService.addOrUpdateCart(produto.id, item, 1).subscribe({
      next: () => {
        this.loadCartCount();
      }
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    document.body.style.overflow = this.menuAberto ? 'hidden' : '';
    this.cdr.detectChanges();
  }

  closeMenu(): void {
    this.menuAberto = false;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUser(): any {
    return this.authService.getUser();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}