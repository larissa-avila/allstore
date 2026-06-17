import { Routes } from '@angular/router';
import { Admin } from './pages/admin/admin';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'admin', component: Admin },
    { path: 'home', component: Home },
];