import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {MatTabsModule} from '@angular/material/tabs';


@Component({
  selector: 'app-cart-main',
  imports: [RouterOutlet,HeaderComponent, FooterComponent, CommonModule, RouterModule, MatTabsModule],
  templateUrl: './cart-main.component.html',
  styleUrl: './cart-main.component.css'
})
export class CartMainComponent implements OnInit {

  currentTitle = 'Cart';
  currentRoute: string = '';
  subscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url; // Get the new route after navigation
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
    this.subscription.unsubscribe(); // Unsubscribe to avoid memory leaks
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
