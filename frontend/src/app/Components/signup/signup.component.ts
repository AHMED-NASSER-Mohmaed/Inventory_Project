import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from '../../_models/account';
import { AccountService } from '../../_services/account.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { decodeToken } from '../../_helpers/jwt-helper';

@Component({
  selector: 'app-signup',
  imports: [ FormsModule , CommonModule , ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnDestroy {

  constructor(public accountService: AccountService , public router: Router , private toastr: ToastrService) {}

  public account: Account = {userType: 'customer'} as Account;

  public sub: Subscription | null = null;
  public isLoading = false;
  
  ensurePhoneNumberStartsWithZero(phoneNumber: any): string {
    const phoneNumberStr = phoneNumber.toString();
    if (!phoneNumberStr.startsWith('0')) {
      return '0' + phoneNumberStr;
    }
    return phoneNumberStr;
  }
  

  signUpForCustomer(){
    this.isLoading = true;
    this.account.phoneNumber = this.ensurePhoneNumberStartsWithZero(this.account.phoneNumber);
    console.log(this.account);
    this.sub = this.accountService.signupForCustomer(this.account.firstName, this.account.lastName, this.account.email, this.account.phoneNumber, this.account.password, this.account.passwordConfirm, this.account.userType).subscribe({
      next: (res: any) => {
        if(res.status){
          localStorage.setItem('token', res.token);

          this.toastr.clear();
          this.toastr.success('Registered Successfully', 'Success', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true
          });

          console.log(res);

          const token = localStorage.getItem('token');
          let tokenData: any = null;
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
        console.log(error);
        this.toastr.clear();
        this.toastr.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
      },
      complete: () => {
        console.log('Signup Complete');
        // const token = localStorage.getItem('token');
        //   let tokenData: any = null;
        //   if (token) {
        //     tokenData = decodeToken(token);
        //     console.log('Decoded token:', tokenData);
        //   }

        //   if (tokenData.id.userType === 'seller') {
        //     setTimeout(() => {
        //       this.router.navigateByUrl('/login');
        //     }, 1500);
        //   }

        //   if (tokenData.id.userType === 'customer') {
        //     setTimeout(() => {
        //       this.router.navigateByUrl('/LandingPage');
        //     }, 1500);
        //   }

        this.router.navigateByUrl('/login');
      }
    })
  }

  signUpForSeller(){
    this.isLoading = true;
    this.account.phoneNumber = this.ensurePhoneNumberStartsWithZero(this.account.phoneNumber);
    this.sub = this.accountService.signupForSeller(this.account.firstName, this.account.lastName, this.account.email, this.account.phoneNumber, this.account.password, this.account.passwordConfirm, this.account.userType , this.account.SSN , this.account.companyRegistrationNumber , this.account.companyName).subscribe({
      next: (res: any) => {
        if(res.status){
          localStorage.setItem('token', res.token);

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
        console.log(error);
      },
      complete: () => {
        console.log('Signup Complete');
        this.router.navigateByUrl('/LandingPage');
        localStorage.removeItem('token');
      }
    })
  }

  navigateToLogin(){
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  
}
