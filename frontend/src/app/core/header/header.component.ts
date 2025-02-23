import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { decodeToken } from '../../_helper/jwt-helper';
import { CommonModule } from '@angular/common';
import { ConfirmLogoutDialogComponent } from '../../confirm-logout-dialog/confirm-logout-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AccountService } from '../../_services/account.service';

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


  constructor(public dialog: MatDialog , public router: Router , public accountService: AccountService) {
    this.token = localStorage.getItem('token');
    
  }
  ngOnInit(): void {
 
    if(this.token){

      this.tokenData=decodeToken(this.token);
      console.log(this.tokenData);
    }

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


}
