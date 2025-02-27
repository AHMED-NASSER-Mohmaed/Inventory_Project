import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { NavigationCancel, NavigationError, NavigationStart, RouterModule, RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {MatTabsModule} from '@angular/material/tabs';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-cart-main',
  imports: [RouterOutlet,HeaderComponent, FooterComponent, CommonModule, RouterModule, MatTabsModule, NgxSpinnerModule],
  templateUrl: './cart-main.component.html',
  styleUrl: './cart-main.component.css'
})
export class CartMainComponent implements OnInit {

  currentTitle = 'Cart';
  currentRoute: string = '';
  subscription!: Subscription;

  constructor(private router: Router, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     this.spinner.show(); // ✅ Show spinner when navigation starts
    //   } 
    //   else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
    //     this.spinner.hide(); // ✅ Hide spinner when navigation ends
    //   }
    // });
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url; 
        if(this.currentRoute.includes('checkout')){
          this.currentTitle = "Checkout";
        }else if(this.currentRoute.includes('order')){
          this.currentTitle = "Complete Order";
        }else{
          this.currentTitle = "Cart";
        }
      }
    });
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }


  // navigateToHomePage(index: number): void {
  //   if(index == 1)
  //     this.router.navigateByUrl('/LandingPage/');
  //   else if(index == 2)
  //   this.router.navigateByUrl('/cartmain/checkout');
  //   else if(index == 3)
  //     this.router.navigateByUrl('/cartmain');
  //   else 
  //     this.router.navigateByUrl('/cartmain');

  // }

  // onTabChange(event: any): void {
  //   switch (event.index) {
  //     case 0:
  //       this.router.navigate(['/LandingPage']);
  //       break;
  //     case 1:
  //       this.router.navigate(['/artmain']);
  //       break;
  //     case 2:
  //       this.router.navigate(['/cartmain/checkout']);
  //       break;
  //     case 3:
  //       this.router.navigate(['/cartmain/'])
  //   }
  // }
  
}
