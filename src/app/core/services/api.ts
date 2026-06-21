import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private dummyUrl = 'https://dummyjson.com';

    private localUrl = 'https://allstore-api.onrender.com';
    // private localUrl = 'http://localhost:3000';

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

    getMe(): Observable<any> {
        const token = localStorage.getItem('token');

        return this.http.get(`${this.dummyUrl}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });
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
    getCart(userId: number): Observable<any> {
        return this.http.get(`${this.localUrl}/cart?userId=${userId}`);
    }

    addToCart(item: any): Observable<any> {
        return this.http.post(`${this.localUrl}/cart`, item);
    }

    removeFromCart(id: number): Observable<any> {
        return this.http.delete(`${this.localUrl}/cart/${id}`);
    }

    updateProduct(id: number, product: any): Observable<any> {
        return this.http.put(`${this.localUrl}/products/${id}`, product);
    }

    getLocalProductById(id: number): Observable<any> {
        return this.http.get(`${this.localUrl}/products/${id}`);
    }

    updateCartItem(id: number, item: any): Observable<any> {
        return this.http.put(`${this.localUrl}/cart/${id}`, item);
    }

    addOrUpdateCart(productId: number, item: any, quantityToAdd: number = 1): Observable<any> {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return new Observable(observer => {
            this.getCart(user.id).subscribe({
                next: (cartItems: any[]) => {

                    const existing = cartItems.find(
                        (c: any) =>
                            c.productId === productId &&
                            c.userId === user.id
                    );

                    if (existing) {
                        this.updateCartItem(existing.id, {
                            ...existing,
                            quantity: existing.quantity + quantityToAdd
                        }).subscribe({
                            next: (res) => observer.next(res),
                            error: (err) => observer.error(err),
                            complete: () => observer.complete()
                        });
                    } else {
                        this.addToCart({
                            ...item,
                            quantity: quantityToAdd,
                            userId: user.id
                        }).subscribe({
                            next: (res) => observer.next(res),
                            error: (err) => observer.error(err),
                            complete: () => observer.complete()
                        });
                    }
                },
                error: (err) => observer.error(err)
            });
        });
    }
}