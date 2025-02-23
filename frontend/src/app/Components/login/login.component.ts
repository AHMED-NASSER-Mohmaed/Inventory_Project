import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { Account } from '../../_models/account';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule , RouterLink , CommonModule , ToastrModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy{

  constructor(public accountService: AccountService , public router: Router, private toastr: ToastrService){}

  public account: Account = {} as Account;

  public sub: Subscription | null = null;


  login(){
    this.sub = this.accountService.login(this.account.email , this.account.password).subscribe({
      next: (res: any) => {
        if(res.status){
            this.toastr.success('Login Successful', 'Success', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true
            });
          this.accountService.setLoginStatus();
          if(res.data.user.userType === "staff"){
            this.accountService.setUserType(res.data.user.role);
          }else{
            this.accountService.setUserType(res.data.user.userType);
          }
          localStorage.setItem('token', res.token);

          console.log(res);
          console.log(res.data.user.role);
          console.log(res.token);
          this.accountService.showLoginStatus();

          if(res.data.user.role === 'admin' && this.accountService.isLoggedIn){
            setTimeout(() => {
              this.router.navigateByUrl('/dashboard');
            }, 1500);
          }

          if(res.data.user.role === 'super_admin' && this.accountService.isLoggedIn){
            setTimeout(() => {
              this.router.navigateByUrl('/dashboard');
            }, 1500);
          }

          if(res.data.user.userType === 'customer' && this.accountService.isLoggedIn){
            setTimeout(() => {
              this.router.navigateByUrl('/LandingPage');
            }, 1500);
          }

          
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
