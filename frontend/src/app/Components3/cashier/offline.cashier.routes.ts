import { Routes } from "@angular/router";
import { CashierOfflineProcessingComponent } from "./cashier-offline-processing/cashier-offline-processing.component";
import { CashierOfflineCompleteComponent } from "./cashier-offline-complete/cashier-offline-complete.component";
import { CashierOfflineCancelledComponent } from "./cashier-offline-cancelled/cashier-offline-cancelled.component";



export const dashRoutes: Routes = [   
    {
        path: '',
        pathMatch: 'full',
        redirectTo:  'process-order',
    }
    ,
  
    {
        path: 'process-order',
        title: 'process-order',
        component: CashierOfflineProcessingComponent,
    },

    {
        path: 'complete-order',
        title: 'Complete order',
        component: CashierOfflineCompleteComponent,
    },

    {
        path: 'cancel-order',
        title: 'Cancel order',
        component: CashierOfflineCancelledComponent,
    },

   

  
];