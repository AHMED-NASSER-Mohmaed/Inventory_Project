import { Routes } from '@angular/router';
import { DeliveredTableComponent } from './Cashier/delivered-table/delivered-table.component';
import { CompletedTableComponent } from './Cashier/completed-table/completed-table.component';
// import { DeliveredTableComponent } from './delivered-table/delivered-table.component';

export const dashRoutes: Routes = [
   
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'delivered-orders',
    }
    ,
  
    {
        path: 'delivered-orders',
        title: 'Delivered orders',
        component: DeliveredTableComponent,
    },

    {
        path: 'completed-orders',
        title: 'completed orders',
        component: CompletedTableComponent,
    },

  
];