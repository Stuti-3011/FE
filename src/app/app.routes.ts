import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', component: RegisterComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'add', component: ProductFormComponent },
  { path: '**', redirectTo: '' }
];