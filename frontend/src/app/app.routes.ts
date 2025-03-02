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
import { ProductsListComponent } from './Components2/products-list/products-list.component';
import { LandingPageComponent } from './Components2/HomePage/landing-page/landing-page.component';
import { ProductdetailsComponent } from './Components/productdetails/productdetails.component';
import { AdminprofileComponent } from './Components/adminprofile/adminprofile.component';
import { SellerprofileComponent } from './Components/sellerprofile/sellerprofile.component';
import { auth3Guard } from './_guards/auth3.guard';
import { auth4Guard } from './_guards/auth4.guard';
import { auth5Guard } from './_guards/auth5.guard';
import { CprofiledetailsComponent } from './Components/cprofiledetails/cprofiledetails.component';
import { ResetpasswordComponent } from './Components/resetpassword/resetpassword.component';
import { ContactsComponent } from './Components2/contacts/contacts.component';
import { AboutComponent } from './Components2/about/about.component';
import { ShoppingcartComponent } from './Components3/shoppingcart/shoppingcart.component';
import { CheckoutDetailsComponent } from './Components3/checkout-details/checkout-details.component';
import { OrderCompeleteComponent } from './Components3/order-compelete/order-compelete.component';
import { CartMainComponent } from './Components3/cart-main/cart-main.component';
import { authGuardForCartGuard } from './_guards/auth-guard-for-cart.guard';
import { Component } from '@angular/core';
import { SpringCollectionComponent } from './Components2/HomePage/spring-collection/spring-collection.component';
import { SuperadminprofileComponent } from './Components/superadminprofile/superadminprofile.component';
import { auth6Guard } from './_guards/auth6.guard';
import { SAprofiledetailsComponent } from './Components/saprofiledetails/saprofiledetails.component';
import { ClerkDashboardComponent } from './Components2/StaffComponents/clerk-dashboard/clerk-dashboard.component';
import { Routes } from '@angular/router';
import { PendingTableComponent } from './Components2/StaffComponents/pending-table/pending-table.component';
import { CashierDashboardComponent } from './Components2/StaffComponents/Cashier/cashier-dashboard/cashier-dashboard.component';
import { ClerkProfileComponent } from './Components/clerk-profile/clerk-profile.component';
import { CashierProfileComponent } from './Components/cashier-profile/cashier-profile.component';
import { auth7Guard } from './auth7.guard';
import { auth8Guard } from './auth8.guard';
import { CustomerOrderDetailsComponent } from './Components/customer-order-details/customer-order-details.component';
import { auth9Guard } from './_guards/auth9.guard';
import { ClerkOfflineDashboardComponent } from './Components3/clerk/clerk-offline-dashboard/clerk-offline-dashboard.component';
import { CashierOfflineDashboardComponent } from './Components3/cashier/cashier-offline-dashboard/cashier-offline-dashboard.component';


export const routes: Routes = [

//     { 
//          path:'clerk-dashboard/pending-orders',
//          component: PendingTableComponent ,
//      }

//   ,


    {
        path: 'LandingPage',
        component: LandingPageComponent,
    },
    {
        path: 'header',
        component: HeaderComponent,
    },
    {
        path: 'slider',
        component: SliderComponent,
    },
    {
        path: 'featured-products',
        component: FeaturedProductsComponent
    },
{
    path: 'springCollection',
    component: SpringCollectionComponent
} 
,
    {
        path: 'category',
        component: CategoryComponent,
    },
    {
        path: 'sale',
        component: SaleComponent,
    },
    { 
        path: 'footer',
        component: FooterComponent,
    },
    {
        path: 'products',
        component: ProductsListComponent,
    },
    {
        // default route
        path: '',
        redirectTo: 'LandingPage',
        pathMatch: 'full'
    },
    
//    {
//     path:'products',
//     component:ProductsListComponent,
//    }
   

  { path:'contacts',
   component:ContactsComponent,
  },


 { path:'about',
    component:AboutComponent,
 },

 {  
     path:'clerk-dashboard',
   component:ClerkDashboardComponent,
 },



 
    {
        // default route
        path: '',
        redirectTo:'LandingPage',
        pathMatch:'full'
    },

    {
        path: 'signup',
        component: SignupComponent,
        title: 'Signup',
        canActivate: [auth2Guard]
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
        canActivate: [auth2Guard]
    },
    {
        path: 'LandingPage/Product/:id',
        component: ProductdetailsComponent,
        title: 'Product Details'
    },




//////////////////////////////////////////

    {

        path:'clerk-dashboard',
        component: ClerkDashboardComponent,
        title: 'Clerk Dashboard',
        children: [
            {
                path:'',
                loadChildren: () => import('./Components2/StaffComponents/staff.routes').then(s => s.dashRoutes),
            },

           
        ]
        
    },

/////////////////////////////////////////////////


{
    path:'cashier-dashboard',
    component: CashierDashboardComponent,
    title: 'cashier Dashboard',
    children: [
        {
            path:'',
            loadChildren:() => import('./Components2/StaffComponents/cashier.routes').then(s => s.dashRoutes),
            
        },

       
    ]
},

///////////////////////////////////////////////////
    
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('./Components/dashboardComponents/dashboard.routes').then(s => s.dashRoutes),
                canActivate: [authGuard]
            }
        ]
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'Adashboard',
                loadChildren: () => import('./Components/dashboardComponents/Admindashboard/Admindashboard.routes').then(s => s.dashRoutes2),
                canActivate: [auth9Guard]
            }
        ]
    },
    // {
    //     path: '',
    //     component: LayoutComponent,
    //     children: [
    //         {
    //             path: 'dashboard',
    //             loadChildren: () => import('./Components/dashboardComponents/dashboard.routes').then(s => s.dashRoutes),
    //             canActivate: [authGuard]
    //         }
    //     ]
    // },
    {
        path: 'lock',
        component: LockComponent,
        title: 'Locked'
    },
    {
        path: 'Cprofile',
        component: UserprofileComponent,
        title: 'Profile',
        canActivate: [auth3Guard],
        children: [
            {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
            },
            {
                path: 'details',
                component: CprofiledetailsComponent,
                title: 'Profile'
            },
            {
                path: 'resetpassword',
                component: ResetpasswordComponent,
                title: 'Reset Password'
            },
            {
                path: 'orders',
                component: CustomerOrderDetailsComponent,
                title: 'Orders'
            }
        ]
    },
    {
        path: 'Sprofile',
        component: SellerprofileComponent,
        title: 'Profile',
        canActivate: [auth4Guard]
    },
    {
        path: 'Aprofile',
        component: AdminprofileComponent,
        title: 'Profile',
        canActivate: [auth5Guard]
    },
    {
        path: 'SAprofile',
        component: SuperadminprofileComponent,
        title: 'Profile',
        canActivate: [auth6Guard],
        children: [
            {
                path: '',
                redirectTo: 'SAdetails',
                pathMatch: 'full'
            },
            {
                path: 'SAdetails',
                component: SAprofiledetailsComponent,
                title: 'Profile'
            },
            {
                path: 'resetpassword',
                component: ResetpasswordComponent,
                title: 'Reset Password'
            }
        ]
    },
    {
        path: 'CLprofile',
        component: ClerkProfileComponent,
        title: 'Profile',
        canActivate: [auth7Guard],
    },
    {
        path: 'CAprofile',
        component: CashierProfileComponent,
        title: 'Profile',
        canActivate: [auth8Guard],
    },
 

{path: "maincart", component: CartMainComponent,
    children: [
        {path: "", component: ShoppingcartComponent},
        {path: "checkout", component: CheckoutDetailsComponent,  canActivate: [authGuardForCartGuard]},
        {path: "completeorder", component: OrderCompeleteComponent,  canActivate: [authGuardForCartGuard]},
        // {path: "checkout", component: CheckoutDetailsComponent},
        // {path: "completeorder", component: OrderCompeleteComponent},
    ]
},


{
    path:'clerk-offline-dashboard',
    component: ClerkOfflineDashboardComponent,
    title: 'Clerk Offline Dashboard',
    children: [
        {
            path:'',
            loadChildren:() => import('./Components3/offline.clerk.routes').then(s => s.dashRoutes),
            
        },

       
    ]
},

{
    path:'cashier-offline-dashboard',
    component: CashierOfflineDashboardComponent,
    title: 'Cashier Offline Dashboard',
    children: [
        {
            path:'',
            loadChildren:() => import('./Components3/cashier/offline.cashier.routes').then(s => s.dashRoutes),
            
        },

       
    ]
},

];




