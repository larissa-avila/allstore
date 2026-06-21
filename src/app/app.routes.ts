import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { HomeAdmin } from './pages/admin/home/home-admin';
import { AddProduct } from './pages/admin/add-product/add-product';
import { Home } from './pages/client/home/home';
import { ProductDetail } from './pages/client/product-detail/product-detail';
import { Cart } from './pages/client/cart/cart';
import { Profile } from './shared/profile/profile';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'admin', component: HomeAdmin, canActivate: [authGuard] },
  { path: 'admin/add-product', component: AddProduct, canActivate: [authGuard] },
  { path: 'product/:id', component: ProductDetail, canActivate: [authGuard] },
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];