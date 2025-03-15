import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { Account } from '../../_models/account';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { decodeToken } from '../../_helpers/jwt-helper';
import { CartService } from '../../_services/cart.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule , RouterLink , CommonModule , ToastrModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy{
  token: string | null | undefined;
  sessionId: string | null = null;
  cartCounter = 0;
  constructor(public accountService: AccountService , public router: Router, private cartService: CartService, private toastr: ToastrService){}

  public account: Account = {} as Account;

  public sub: Subscription | null = null;

  public isLoading = false;

  login(){
    this.isLoading = true;
    // Clear any previous toaster messages to avoid spam.
    this.toastr.clear();
    this.sub = this.accountService.login(this.account.email , this.account.password).subscribe({
      next: (res: any) => {
        if(res.status){
          this.toastr.clear();
            this.toastr.success('Login Successful', 'Success', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true
            });

          console.log(res);

          localStorage.setItem('token', res.token);

          const token = localStorage.getItem('token');
          let tokenData: any = null;
          if (token) {
            tokenData = decodeToken(token);
            console.log('Decoded token:', tokenData);
          }


          if(tokenData.id.role === 'admin'){
            setTimeout(() => {
              this.router.navigateByUrl('/LandingPage');
            }, 1500);
          }else if(tokenData.id.role === 'super_admin'){
            setTimeout(() => {
              this.router.navigateByUrl('/dashboard');
            }, 1500);
          }else{
            setTimeout(() => {
              this.router.navigateByUrl('/LandingPage');
            }, 1500);
          }

          
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.clear();
        this.toastr.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
        
        console.log(error)
      },
      complete: () => {
        console.log('Login Complete');
        this.sessionId = localStorage.getItem('sessionId');
        this.loadCart();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadCart() {
    if(localStorage.getItem('sessionId')){
      this.sessionId = localStorage.getItem('sessionId');
    }
    // Load the cart count immediately from localStorage to prevent flickering
    const storedCount = localStorage.getItem('cartCounter');
    this.cartCounter = storedCount ? parseInt(storedCount, 10) : 0;
  
    this.cartService.getCart(this.sessionId!).subscribe((response) => {
      const count = response.cart.products.length > 0 ? response.cart.products.length : 0;
      this.cartCounter = count;
      localStorage.setItem('cartCounter', count.toString());
       if (localStorage.getItem('token') && !response.sessionId && localStorage.getItem('sessionId')) {
        localStorage.removeItem('sessionId');
        this.sessionId = null;
      }
      
      if (!localStorage.getItem('token') && response.sessionId && (response.sessionId !== localStorage.getItem('sessionId'))) {
        localStorage.setItem('sessionId', response.sessionId);
        this.sessionId = response.sessionId;
      }
        
    }, 
    (error) => {
      this.cartCounter = 0;
      localStorage.setItem('cartCounter', '0');
    });
  }


}
