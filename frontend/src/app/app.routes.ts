import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { SignupComponent } from './Components/signup/signup.component';
import { authGuard } from './_guards/auth.guard';
import { LockComponent } from './Components/lock/lock.component';
import { auth2Guard } from './_guards/auth2.guard';
import { UserprofileComponent } from './Components/userprofile/userprofile.component';

export const routes: Routes = [

    {
        path: '',
        redirectTo:'signup',
        pathMatch:'full'
    },

    {
        path: 'signup',
        component: SignupComponent,
        title: 'Signup',
        canActivate:[auth2Guard]
    },

    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
        canActivate:[auth2Guard]
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
    },

    {
        path: "profile",
        component: UserprofileComponent,
        title: 'Profile',
    }

];
