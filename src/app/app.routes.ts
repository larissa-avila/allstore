import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { HomeAdmin } from './pages/admin/home/home-admin';
import { AddProduct } from './pages/admin/add-product/add-product';
import { Home } from './pages/client/home/home';
import { ProductDetail } from './pages/client/product-detail/product-detail';
import { Cart } from './pages/client/cart/cart';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'admin', component: HomeAdmin },
  { path: 'admin/add-product', component: AddProduct },
  { path: 'home', component: Home },
  { path: 'product/:id', component: ProductDetail },
  { path: 'cart', component: Cart },
];