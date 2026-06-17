import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://dummyjson.com';

    constructor(private http: HttpClient) { }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, {
            username,
            password,
            expiresInMins: 60
        });
    }

    getMe(token: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isAdmin(): boolean {
        return this.getUser()?.role === 'admin';
    }
}