import { Routes } from "@angular/router";
import { ClerkOfflineCreateComponent } from "./clerk/clerk-offline-create/clerk-offline-create.component";
import { ClerkOfflineProcessingComponent } from "./clerk/clerk-offline-processing/clerk-offline-processing.component";


export const dashRoutes: Routes = [   
    {
        path: '',
        pathMatch: 'full',
        redirectTo:  'create-order',
    }
    ,
  
    {
        path: 'create-order',
        title: 'Create order',
        component: ClerkOfflineCreateComponent,
    },

    {
        path: 'process-order',
        title: 'Processing order',
        component: ClerkOfflineProcessingComponent,
    },

   

  
];