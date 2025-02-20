import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SellersComponent } from './sellers/sellers.component';
import { CustomersComponent } from './customers/customers.component';

export const dashRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard',
    children: [
      {
        path: '',
        redirectTo: 'customers',
        pathMatch: 'full'
      },
      { 
        path: 'customers',
        component: CustomersComponent,
        title: 'Customers'
      },
      { 
        path: 'sellers',
        component: SellersComponent,
        title: 'Sellers'
      },
    ]
  }
];