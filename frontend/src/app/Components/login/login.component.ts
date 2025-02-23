import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { Account } from '../../_models/account';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { decodeToken } from '../../_helpers/jwt-helper';


@Component({
  selector: 'app-login',
  imports: [FormsModule , RouterLink , CommonModule , ToastrModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy{

  constructor(public accountService: AccountService , public router: Router, private toastr: ToastrService){}

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
              this.router.navigateByUrl('/dashboard');
            }, 1500);
          }

          if(tokenData.id.role === 'super_admin'){
            setTimeout(() => {
              this.router.navigateByUrl('/dashboard');
            }, 1500);
          }

          if(tokenData.id.userType === 'customer'){
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
      }
    })
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }


}
