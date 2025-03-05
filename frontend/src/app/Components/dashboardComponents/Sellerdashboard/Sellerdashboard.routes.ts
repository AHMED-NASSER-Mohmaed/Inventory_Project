import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ProductsComponent } from './products/products.component';
import { AddProductsComponent } from './add-products/add-products.component';
import { PendingComponent } from './orders/pending/pending.component';
import { ProcessingComponent } from './orders/processing/processing.component';
import { ShippedComponent } from './orders/shipped/shipped.component';
import { DeliverdComponent } from './orders/deliverd/deliverd.component';
import { CanceledComponent } from './orders/canceled/canceled.component';
import { AnalticsComponent } from './analtics/analtics.component';
import { CompletedTableComponent } from './orders/completed-table/completed-table.component';


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

      },
      {
        path: 'seller-pending-orders',
        component: PendingComponent,
        title: 'Pending Orders'
      },
      {
        path: 'seller-processing-orders',
        component: ProcessingComponent,
        title: 'Processing Orders'
      },
      {
        path: 'seller-shipped-orders',
        component: ShippedComponent,
        title: 'Shipped Orders'
      },
      {
        path: 'seller-delivered-orders',
        component: DeliverdComponent,
        title: 'Delivered Orders'
      },
      {
        path: 'seller-cancelled-orders',
        component: CanceledComponent,
        title: 'Cancelled Orders'
      },
      {
        path: 'analytics',
        component: AnalticsComponent,
        title: 'Analytics'
      },
      {
        path: 'completed',
        component: CompletedTableComponent,
        title: 'Completed Orders'
      }
    ]
  }
];