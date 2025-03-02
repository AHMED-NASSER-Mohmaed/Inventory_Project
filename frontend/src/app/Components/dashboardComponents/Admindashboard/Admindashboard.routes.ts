import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CashiersComponent } from './cashiers/cashiers.component';
import { ClerksComponent } from './clerks/clerks.component';
import { ProductsComponent } from './products/products.component';
import { OrdersComponent } from './orders/orders.component';


export const dashRoutes2: Routes = [
  {
    path: '',
    component: MainComponent,
    title: 'Dashboard',
    children: [
      {
        path: '',
        redirectTo: 'Cashiers',
        pathMatch: 'full'
      },
      { 
        path: 'Cashiers',
        component: CashiersComponent,
        title: 'Cashiers'
      },
      {
        path: 'Clerks',
        component: ClerksComponent,
        title: 'Clerks'
      },
      {
        path: 'products',
        component: ProductsComponent,
        title: 'Products'
      }, 
      {
      path: 'orders',
      component: OrdersComponent,
      title: 'Orders'
      }
    ]
  }
];