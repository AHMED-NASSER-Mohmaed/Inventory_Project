import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersProfileService } from '../../_services/customer-profile.service';
import { AccountService } from '../../_services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmresetComponent } from '../confirmreset/confirmreset.component';

@Component({
  selector: 'app-resetpassword',
  imports: [FormsModule, CommonModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.css',
})
export class ResetpasswordComponent {
  constructor(
    public customerProfileService: CustomersProfileService,
    public accountService: AccountService,
    public dialog: MatDialog,
    public router: Router,
    private toastr: ToastrService
  ) {}

  isEditing = false;
  sub = {} as Subscription;

  // Added password variables for reset password feature
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  saveChanges() {
    const data = {
      passwordCurrent: this.oldPassword,
      password: this.newPassword,
      passwordConfirm: this.confirmPassword,
    };

    this.accountService.resetPassword(data).subscribe({
      next: (response) => {
        console.log('Password reset successfully', response);
        this.toastr.clear();
        this.toastr.success('Password reset successfully', 'Success', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        this.router.navigateByUrl('/login');
        this.accountService.logout();
      },
      error: (error) => {
        console.error('Error resetting password', error);
        this.toastr.clear();
        this.toastr.error(error.error.message, 'Failed', {
          timeOut: 1500,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true,
        });
      },
    });
  }

  openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmresetComponent);
    this.sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveChanges();
      } else {
        console.log('User canceled resetting');
      }
    });
  }
}
