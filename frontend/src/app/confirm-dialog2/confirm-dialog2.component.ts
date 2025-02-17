import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog2.component.html',
  imports: [MatIconModule , MatDialogModule]
})
export class ConfirmDialogComponent2 {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent2>) {}

  onClose(): void {
    this.dialogRef.close(false);
  }

  onActivate(): void {
    this.dialogRef.close(true);
  }
}