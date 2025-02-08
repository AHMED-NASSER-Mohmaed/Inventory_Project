import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sellerinfodialog',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './sellerinfodialog.component.html',
  styleUrl: './sellerinfodialog.component.css'
})
export class SellerinfodialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
