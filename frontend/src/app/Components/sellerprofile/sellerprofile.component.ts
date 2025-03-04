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
import { ConfirmDialogImgchangeComponent } from '../../confirm-dialog-imgchange/confirm-dialog-imgchange.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-sellerprofile',
  imports: [FormsModule , CommonModule , RouterLink],
  templateUrl: './sellerprofile.component.html',
  styleUrl: './sellerprofile.component.css'
})
export class SellerprofileComponent implements OnInit {
  constructor(public customerProfileService: CustomersProfileService ,public accountService: AccountService, public dialog: MatDialog, public router: Router, private toastr: ToastrService){}

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

   triggerImageUpload() {
         document.getElementById('imageUpload')?.click();
       }
     
       // onImageChange(event: any) {
       //   const file = event.target.files[0];
       //   if (file) {
       //     const reader = new FileReader();
       //     reader.onload = (e: any) => {
       //       document.querySelector('.firstImage')?.setAttribute('src', e.target.result);
       //     };
       //     reader.readAsDataURL(file);
       //   }
       // }
   
   
   
   
   
       async onImageChange(event: any): Promise<void> {
         const fileInput = event.target;
         const file = fileInput.files[0];
           const backupUrl = this.userP;
           const reader = new FileReader();
           reader.onload = (e: any) => {
             const tempUrl = e.target.result;
             const dialogRef = this.dialog.open(ConfirmDialogImgchangeComponent);
             const sub = dialogRef.afterClosed().subscribe(async (result) => {
               if (result) {
                 try {
                   const response: any = await this.customerProfileService
                     .changeImage(file)
                     .toPromise();
                   if (response.message === 'success') {
                     this.userP = tempUrl;
                   } else {
                     this.userP = backupUrl;
                   }
                 } catch (error) {
                   this.toastr.clear();
                   this.toastr.error((error as any).error.message, 'Failed', {
                     timeOut: 1500,
                     positionClass: 'toast-bottom-right',
                     progressBar: true,
                     closeButton: true
                   });
                   console.error('Error updating image', error);
                   this.userP = backupUrl;
                 }
               } else {
                 this.userP = backupUrl;
               }
               fileInput.value = '';
             });
           };
           reader.readAsDataURL(file);
       }

  

 
}
