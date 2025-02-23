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
import { decodeToken } from '../../_helpers/jwt-helper';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  imports: [FormsModule , CommonModule , RouterLink , RouterOutlet],
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements AfterViewInit , OnInit {
  tokenData: any;

  constructor(public customerProfileService: CustomersProfileService , public accountService: AccountService, public dialog: MatDialog, public router: Router){}

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