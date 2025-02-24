import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersProfileService } from '../../_services/customer-profile.service';
import { Account } from '../../_models/account';
import { AccountService } from '../../_services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmLogoutDialogComponent } from '../../confirm-logout-dialog/confirm-logout-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogImgchangeComponent } from '../../confirm-dialog-imgchange/confirm-dialog-imgchange.component';

@Component({
  selector: 'app-cprofiledetails',
  imports: [FormsModule , CommonModule ],
  templateUrl: './cprofiledetails.component.html',
  styleUrl: './cprofiledetails.component.css'
})

export class CprofiledetailsComponent implements AfterViewInit , OnInit{
  constructor(public customerProfileService: CustomersProfileService , public accountService: AccountService, public dialog: MatDialog, public router: Router , private toastr: ToastrService){}
  
    isEditing = false;
    sub = {} as Subscription;
  
  
    user = {} as Account;
    userP : string = '';
  
    ngOnInit(): void {
      this.sub = this.customerProfileService.getMe().subscribe({
        next: (res: any) => {
          this.user = res.user;
          this.userP = res.user.photo.url;
          console.log(res);
        },
        error: (error) => {
          console.log(error);
        },
      })
    }
  
  
  
  
  
    ngAfterViewInit() {
      const navLinks = document.querySelectorAll('nav a');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // document.querySelectorAll('.rightbox > div')
          //   .forEach(div => div.classList.add('noshow'));
          
          const sectionId = '.' + link.id;
          // document.querySelector(sectionId)?.classList.remove('noshow');
        });
      });
    }
  
    toggleEdit() {
      this.isEditing = !this.isEditing;
    }
  
    handleSaveClick() {
      if (this.isEditing) {
        this.saveChanges();
      } else {
        this.toggleEdit();
      }
    }
  
    saveChanges() {
      this.sub = this.customerProfileService.updateMe(this.user.firstName, this.user.lastName, this.user.phoneNumber, this.user.email).subscribe({
        next: (res) => {
          console.log(res);
          this.toggleEdit();
          this.toastr.clear();
          this.toastr.success('Details Updated Successfully', 'Success', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
        },
        error: (error) => {
          console.log(error);
          this.toastr.clear();
          this.toastr.error(error.error.message, 'Failed', {
            timeOut: 1500,
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
          });
        },
        complete: () => {
          console.log('Update Me Complete');
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
