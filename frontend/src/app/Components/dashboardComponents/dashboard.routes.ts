import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { SellersComponent } from './sellers/sellers.component';

export const dashRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard',
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      { 
        path: 'users',
        component: UsersComponent,
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