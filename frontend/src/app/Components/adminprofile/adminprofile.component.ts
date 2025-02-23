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
import { decodeToken } from '../../_helpers/jwt-helper';

@Component({
  selector: 'app-adminprofile',
  imports: [FormsModule , CommonModule , RouterLink],
  templateUrl: './adminprofile.component.html',
  styleUrl: './adminprofile.component.css'
})
export class AdminprofileComponent {
  tokenData: any;
  constructor(public customerProfileService: CustomersProfileService ,public accountService: AccountService, public dialog: MatDialog, public router: Router){}
  
    isEditing = false;
    sub = {} as Subscription;
  
  
    user = {} as Account;
    userP : string = '';
  
    ngOnInit(): void {
     const token = localStorage.getItem('token');
         if (token) {
           this.tokenData = decodeToken(token);
           console.log('Decoded token:', this.tokenData);
         }
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
