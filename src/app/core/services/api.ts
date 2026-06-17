import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private dummyUrl = 'https://dummyjson.com';
    private localUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    // DummyJSON - Produtos
    getProducts(): Observable<any> {
        return this.http.get(`${this.dummyUrl}/products?limit=100`);
    }

    getProductsByCategory(category: string): Observable<any> {
        return this.http.get(`${this.dummyUrl}/products/category/${category}`);
    }

    searchProducts(query: string): Observable<any> {
        return this.http.get(`${this.dummyUrl}/products/search?q=${query}`);
    }

    getCategories(): Observable<any> {
        return this.http.get(`${this.dummyUrl}/products/categories`);
    }

    getProductById(id: number): Observable<any> {
        return this.http.get(`${this.dummyUrl}/products/${id}`);
    }

    // JSON Server - Produtos do Admin
    getLocalProducts(): Observable<any> {
        return this.http.get(`${this.localUrl}/products`);
    }

    addProduct(product: any): Observable<any> {
        return this.http.post(`${this.localUrl}/products`, product);
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.localUrl}/products/${id}`);
    }

    // JSON Server - Carrinho
    getCart(): Observable<any> {
        return this.http.get(`${this.localUrl}/cart`);
    }

    addToCart(item: any): Observable<any> {
        return this.http.post(`${this.localUrl}/cart`, item);
    }

    removeFromCart(id: number): Observable<any> {
        return this.http.delete(`${this.localUrl}/cart/${id}`);
    }
}