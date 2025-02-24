import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { decodeToken } from '../../_helper/jwt-helper';
import { CommonModule } from '@angular/common';
import { ConfirmLogoutDialogComponent } from '../../confirm-logout-dialog/confirm-logout-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AccountService } from '../../_services/account.service';
import { CartService } from '../../_services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent  implements OnInit {
  tokenData: any=null;
  token: string | null;
  sub = {} as Subscription;
  sessionId: string | null = null;
  cartCounter = 0;
  constructor(public dialog: MatDialog , public router: Router , public accountService: AccountService, private cartService: CartService) {
    this.token = localStorage.getItem('token');
    
  }
  ngOnInit(): void {
 
    if(this.token){

      this.tokenData=decodeToken(this.token);
      console.log(this.tokenData);
    }
    this.sessionId = localStorage.getItem('sessionId');
    this.loadCart();

  }

  loadCart() {
    // Load the cart count immediately from localStorage to prevent flickering
    const storedCount = localStorage.getItem('cartCounter');
    this.cartCounter = storedCount ? parseInt(storedCount, 10) : 0;
  
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      const count = response.cart.products.length > 0 ? response.cart.products.length : 0;
      this.cartCounter = count;
  
      localStorage.setItem('cartCounter', count.toString());
  
      if (!this.sessionId && response.sessionId) {
        localStorage.setItem('sessionId', response.sessionId);
      } else if (!response.sessionId) {
        localStorage.removeItem('sessionId');
      }
    });
  }
  
 openConfirmDialog() {
     const dialogRef = this.dialog.open(ConfirmLogoutDialogComponent);
     this.sub = dialogRef.afterClosed().subscribe((result) => {
       if (result) {
        this.router.navigateByUrl('/login');
         this.accountService.logout();
       } else {
         console.log('User canceled logout');
       }
     });
   }
 logout(){
  localStorage.removeItem("token");
  localStorage.removeItem("sessionId");
 }


}
