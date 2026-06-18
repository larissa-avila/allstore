import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { HomeAdmin } from './pages/admin/home/home-admin';
import { AddProduct } from './pages/admin/add-product/add-product';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'admin', component: HomeAdmin },
  { path: 'admin/add-product', component: AddProduct },
  { path: 'admin/add-product/:id', component: AddProduct },
];