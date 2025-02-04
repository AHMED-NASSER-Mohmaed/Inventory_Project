import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from '../../_models/account';
import { AccountService } from '../../_services/account.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ FormsModule , CommonModule , ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnDestroy {

  constructor(public accountService: AccountService , public router: Router) {}

  public account: Account = {userType: 'customer'} as Account;

  public sub: Subscription | null = null;
  
  ensurePhoneNumberStartsWithZero(phoneNumber: any): string {
    const phoneNumberStr = phoneNumber.toString();
    if (!phoneNumberStr.startsWith('0')) {
      return '0' + phoneNumberStr;
    }
    return phoneNumberStr;
  }
  

  signUpForCustomer(){
    this.account.phoneNumber = this.ensurePhoneNumberStartsWithZero(this.account.phoneNumber);
    console.log(this.account);
    this.sub = this.accountService.signupForCustomer(this.account.firstName, this.account.lastName, this.account.email, this.account.phoneNumber, this.account.password, this.account.passwordConfirm, this.account.userType).subscribe({
      next: (res: any) => {
        if(res.status){
          alert('Signup Success');
          this.accountService.setLoginStatus();
          this.accountService.setUserType(res.data.user.userType);
          localStorage.setItem('token', res.token);

          console.log(res);
          console.log(res.data.user.userType);
          console.log(res.token);
          this.accountService.showLoginStatus();
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Signup Complete');
      }
    })
  }

  signUpForSeller(){
    this.account.phoneNumber = this.ensurePhoneNumberStartsWithZero(this.account.phoneNumber);
    this.sub = this.accountService.signupForSeller(this.account.firstName, this.account.lastName, this.account.email, this.account.phoneNumber, this.account.password, this.account.passwordConfirm, this.account.userType , this.account.SSN , this.account.companyRegistrationNumber , this.account.companyName).subscribe({
      next: (res: any) => {
        if(res.status){
          alert('Signup Success');
          this.accountService.setLoginStatus();
          this.accountService.setUserType(res.data.user.userType);
          localStorage.setItem('token', res.token);

          console.log(res);
          console.log(res.data.user.userType);
          console.log(res.token);
          this.accountService.showLoginStatus();
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Signup Complete');
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
