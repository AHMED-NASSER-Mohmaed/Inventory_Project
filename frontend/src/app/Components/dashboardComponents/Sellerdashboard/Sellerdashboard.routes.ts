import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ProductsComponent } from './products/products.component';
import { AddProductsComponent } from './add-products/add-products.component';


export const dashRoutes3: Routes = [
  {
    path: '',
    component: MainComponent,
    title: 'Dashboard',
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      { 
        path: 'products',
        component: ProductsComponent,
        title: 'Products'
      },
      {
        path: 'sell-new-products',
        component: AddProductsComponent,
        title: 'Sell Products'

      }
    ]
  }
];