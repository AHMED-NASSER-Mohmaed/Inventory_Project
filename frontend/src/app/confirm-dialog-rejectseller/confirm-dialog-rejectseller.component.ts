import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog-rejectseller',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './confirm-dialog-rejectseller.component.html',
  styleUrl: './confirm-dialog-rejectseller.component.css'
})
export class ConfirmDialogRejectsellerComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogRejectsellerComponent>) {}
    
      onClose(): void {
        this.dialogRef.close(false);
      }
    
      onReject(): void {
        this.dialogRef.close(true);
      }
}
