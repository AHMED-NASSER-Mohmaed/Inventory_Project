import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersProfileService } from '../../_services/customer-profile.service';
import { Account } from '../../_models/account';
import { AccountService } from '../../_services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resetpassword',
  imports: [FormsModule , CommonModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.css'
})

export class ResetpasswordComponent implements  OnInit{
  constructor(public customerProfileService: CustomersProfileService , public accountService: AccountService, public dialog: MatDialog, public router: Router){}
  
    isEditing = false;
    sub = {} as Subscription;

    // Added password variables for reset password feature
    oldPassword: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
  
    ngOnInit(): void {
      // this.sub = this.customerProfileService.getMe().subscribe({
      //   next: (res: any) => {
      //     console.log(res);
      //     this.user = res.user;
      //     this.userP = res.user.photo.url;
      //     console.log(this.userP);
      //   },
      //   error: (error) => {
      //     console.log(error);
      //   },
      //   complete: () => {
      //     console.log('Get Me Complete');
      //   }
      // })
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
}
