import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-confirm-dialog-approveseller',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './confirm-dialog-approveseller.component.html',
  styleUrl: './confirm-dialog-approveseller.component.css'
})
export class ConfirmDialogApprovesellerComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogApprovesellerComponent>) {}
  
    onClose(): void {
      this.dialogRef.close(false);
    }
  
    onApprove(): void {
      this.dialogRef.close(true);
    }
}
