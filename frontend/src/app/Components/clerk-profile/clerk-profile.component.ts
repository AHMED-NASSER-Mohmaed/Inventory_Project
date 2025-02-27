import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersProfileService } from '../../_services/customer-profile.service';
import { Account } from '../../_models/account';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmLogoutDialogComponent } from '../../confirm-logout-dialog/confirm-logout-dialog.component';

@Component({
  selector: 'app-clerk-profile',
  imports: [FormsModule , CommonModule , RouterLink],
  templateUrl: './clerk-profile.component.html',
  styleUrl: './clerk-profile.component.css'
})
export class ClerkProfileComponent implements OnInit{
  constructor(public customerProfileService: CustomersProfileService ,public accountService: AccountService, public dialog: MatDialog, public router: Router){}

  isEditing = false;
  sub = {} as Subscription;


  user = {} as Account;
  userP : string = '';

  ngOnInit(): void {
    this.sub = this.customerProfileService.getMe().subscribe({
      next: (res: any) => {
        console.log(res);
        this.user = res.user;
        this.userP = res.user.photo.url;
        console.log(this.userP);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Get Me Complete');
      }
    })
  }




 openConfirmDialog(){
     const dialogRef = this.dialog.open(ConfirmLogoutDialogComponent);
     this.sub = dialogRef.afterClosed().subscribe(result => {
       if (result) {
         this.router.navigateByUrl('/login');
         this.accountService.logout();
       } else {
         console.log('User canceled logout');
       }
     });
   }
}
