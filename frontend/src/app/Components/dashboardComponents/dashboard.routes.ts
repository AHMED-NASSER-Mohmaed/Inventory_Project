import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SellersComponent } from './sellers/sellers.component';
import { CustomersComponent } from './customers/customers.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { CatagoriesComponent } from './catagories/catagories.component';
import { AdminsComponent } from './admins/admins.component';
import { CashiersComponent } from './cashiers/cashiers.component';
import { ClerksComponent } from './clerks/clerks.component';
import { FeedbacksComponent } from './feedbacks/feedbacks.component';
import { BranchesComponent } from './branches/branches.component';

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
      {
        path: 'suppliers',
        component: SuppliersComponent,
        title: 'Suppliers'
      },
      {
        path: 'categories',
        component: CatagoriesComponent,
        title: 'Categories'
      },
      {
        path: 'admins',
        component: AdminsComponent,
        title: 'Admins'
      },
      {
        path: 'cashiers',
        component: CashiersComponent,
        title: 'Cashiers'
      },
      {
        path: 'clerks',
        component: ClerksComponent,
        title: 'Clerks'
      },
      {
        path: 'feedbacks',
        component: FeedbacksComponent,
        title: 'Feedbacks'
      },
      {
        path: 'branches',
        component: BranchesComponent,
        title: 'Branches'
      }
    ]
  }
];