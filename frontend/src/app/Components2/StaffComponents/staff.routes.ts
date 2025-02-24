import { Routes } from '@angular/router';
import { ClerkDashboardComponent } from './clerk-dashboard/clerk-dashboard.component';
import { PendingTableComponent } from './pending-table/pending-table.component';

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
    }

];