import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { SignupComponent } from './Components/signup/signup.component';
import { authGuard } from './_guards/auth.guard';
import { LockComponent } from './Components/lock/lock.component';
import { auth2Guard } from './_guards/auth2.guard';
import { UserprofileComponent } from './Components/userprofile/userprofile.component';
import { HeaderComponent } from './core/header/header.component';
import { SliderComponent } from './Components2/HomePage/slider/slider.component';

import { FeaturedProductsComponent } from './Components2/HomePage/featured-products/featured-products.component';
import { SaleComponent } from './Components2/HomePage/sale/sale.component';
import { CategoryComponent } from './Components2/HomePage/category/category.component';
import { FooterComponent } from './core/footer/footer.component';
import { ProductsComponent } from './Components/dashboardComponents/products/products.component';
import { ProductsListComponent } from './Components2/products-list/products-list.component';
import { LandingPageComponent } from './Components2/HomePage/landing-page/landing-page.component';
import { Component } from '@angular/core';
import { ContactsComponent } from './Components2/contacts/contacts.component';
import { AboutComponent } from './Components2/about/about.component';

export const routes: Routes = [


    {

        path:'LandingPage',
        component:LandingPageComponent,
    },
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
        path: 'featured-products',
        component: FeaturedProductsComponent
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
    path:'products',
    component:ProductsListComponent,
   }
   ,

  { path:'contacts',
   component:ContactsComponent,
  },


 { path:'about',
    component:AboutComponent,
 },

 
    {
        // default route
        path: '',
        redirectTo:'login',
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

,
 


];




