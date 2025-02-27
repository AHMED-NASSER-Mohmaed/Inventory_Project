import { Routes } from '@angular/router';
import { ClerkDashboardComponent } from './clerk-dashboard/clerk-dashboard.component';
import { PendingTableComponent } from './pending-table/pending-table.component';
import { CancelledTableComponent } from './cancelled-table/cancelled-table.component';
import { ProcessingTableComponent } from './processing-table/processing-table.component';
import { ShippedTableComponent } from './shipped-table/shipped-table.component';
import { DeliveredTableComponent } from './delivered-table/delivered-table.component';
import { CompletedTableComponent } from './Cashier/completed-table/completed-table.component';
// import { DeliveredTableComponent } from './delivered-table/delivered-table.component';

export const dashRoutes: Routes = [
   
    {
        path: '',
        title: 'Pending orders',
        component:PendingTableComponent,
    }
    ,
    {
        path: 'pending-orders',
        title: 'Pending orders',
        component:PendingTableComponent,
    },
    
    {
        path: 'processing-orders',
        title: 'processing orders',
        component:ProcessingTableComponent,
    }
    ,

    {
        path: 'cancelled-orders',
        title: 'cancelled orders',
        component: CancelledTableComponent,
    },
    {
        path: 'shipped-orders',
        title: 'Shipped orders',
        component: ShippedTableComponent,
    },
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