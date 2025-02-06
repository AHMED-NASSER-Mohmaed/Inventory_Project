import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { SignupComponent } from './Components/signup/signup.component';
import { authGuard } from './_guards/auth.guard';
import { LockComponent } from './Components/lock/lock.component';
import { HeaderComponent } from './core/header/header.component';
import { SliderComponent } from './Components2/HomePage/slider/slider.component';
import { CategoryComponent } from './Components2/category/category.component';
import { FeaturedProductsComponent } from './Components2/featured-products/featured-products.component';
import { SaleComponent } from './Components2/sale/sale.component';
import { FooterComponent } from './core/footer/footer.component';

export const routes: Routes = [
    {
        path:'header',
        component: HeaderComponent,
        
     }
    ,
    {
    path: 'slider',
    component:SliderComponent,
    }
    ,

    {
        path: 'Featured',
        component:FeaturedProductsComponent,
        }
,
    {
        path: 'category',
        component:CategoryComponent,
    }

    ,


    {
        path: 'sale',
        component:SaleComponent,
    }

    ,

    { 
        path:'footer',
        component:FooterComponent,

    },

    {
        // default route
        path: '',
        redirectTo:'footer',
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

,
 


];
