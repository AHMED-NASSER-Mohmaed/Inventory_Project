import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog-approveseller2',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './confirm-dialog-approveseller2.component.html',
  styleUrl: './confirm-dialog-approveseller2.component.css'
})
export class ConfirmDialogApproveseller2Component {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogApproveseller2Component>) {}
    
      onClose(): void {
        this.dialogRef.close(false);
      }
    
      onApprove(): void {
        this.dialogRef.close(true);
      }
}
