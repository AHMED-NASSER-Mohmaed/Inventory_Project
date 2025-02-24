import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-confirmreset',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './confirmreset.component.html',
  styleUrl: './confirmreset.component.css'
})
export class ConfirmresetComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmresetComponent>) {}
  
  onClose(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.dialogRef.close(true);
  }
}
