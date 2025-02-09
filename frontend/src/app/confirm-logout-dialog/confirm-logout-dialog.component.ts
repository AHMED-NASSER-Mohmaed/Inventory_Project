import { Component } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-logout-dialog',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './confirm-logout-dialog.component.html',
  styleUrl: './confirm-logout-dialog.component.css'
})
export class ConfirmLogoutDialogComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
  
    onClose(): void {
      this.dialogRef.close(false);
    }
  
    logout(): void {
      this.dialogRef.close(true);
    }

}
