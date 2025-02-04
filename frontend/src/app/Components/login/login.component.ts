import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { Account } from '../../_models/account';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [FormsModule , RouterLink , CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy{

  constructor(public accountService: AccountService){}

  public account: Account = {} as Account;

  public sub: Subscription | null = null;


  login(){
    this.sub = this.accountService.login(this.account.email , this.account.password).subscribe({
      next: (res: any) => {
        if(res.status){
          alert('Login Success');
          this.accountService.setLoginStatus();
          this.accountService.setUserType(res.data.user.role);
          localStorage.setItem('token', res.token);

          console.log(res);
          console.log(res.data.user.role);
          console.log(res.token);
          this.accountService.showLoginStatus();
        }
      },
      error: (error) => {
        console.log(error)
      },
      complete: () => {
        console.log('Login Complete');
      }
    })
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }


}
