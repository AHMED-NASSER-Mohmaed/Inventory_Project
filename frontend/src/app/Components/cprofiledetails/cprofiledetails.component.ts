import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersProfileService } from '../../_services/customer-profile.service';
import { Account } from '../../_models/account';
import { AccountService } from '../../_services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ConfirmLogoutDialogComponent } from '../../confirm-logout-dialog/confirm-logout-dialog.component';
@Component({
  selector: 'app-cprofiledetails',
  imports: [FormsModule , CommonModule , RouterLink , ],
  templateUrl: './cprofiledetails.component.html',
  styleUrl: './cprofiledetails.component.css'
})
export class CprofiledetailsComponent implements AfterViewInit , OnInit{
  constructor(public customerProfileService: CustomersProfileService , public accountService: AccountService, public dialog: MatDialog, public router: Router){}
  
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
        this.toggleEdit();
      } else {
        this.toggleEdit();
      }
    }
  
    saveChanges() {
      console.log("lol")
    }
  
    triggerImageUpload() {
      document.getElementById('imageUpload')?.click();
    }
  
    onImageChange(event: any) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          document.querySelector('.firstImage')?.setAttribute('src', e.target.result);
        };
        reader.readAsDataURL(file);
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
