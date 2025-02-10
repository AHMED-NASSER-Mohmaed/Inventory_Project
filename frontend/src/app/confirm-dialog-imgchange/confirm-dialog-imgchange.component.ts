import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog-imgchange',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './confirm-dialog-imgchange.component.html',
  styleUrl: './confirm-dialog-imgchange.component.css'
})
export class ConfirmDialogImgchangeComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogImgchangeComponent>) {}
  
    onClose(): void {
      this.dialogRef.close(false);
    }
  
    onChange(): void {
      this.dialogRef.close(true);
    }
}
