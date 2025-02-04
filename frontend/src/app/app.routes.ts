import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { SignupComponent } from './Components/signup/signup.component';
import { authGuard } from './_guards/auth.guard';
import { LockComponent } from './Components/lock/lock.component';

export const routes: Routes = [

    {
        path: '',
        redirectTo:'signup',
        pathMatch:'full'
    },

    {
        path: 'signup',
        component: SignupComponent,
        title: 'Signup'
    },

    {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
    },

    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadChildren: ()=> import('./Components/dashboardComponents/dashboard.routes').then(s => s.dashRoutes),
                canActivate:[authGuard]
            }
        ]
    },

    {
        path: 'lock',
        component: LockComponent,
        title: 'Locked'
    }

];
