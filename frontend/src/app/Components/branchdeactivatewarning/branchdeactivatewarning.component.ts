import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-branchdeactivatewarning',
  imports: [MatIconModule , MatDialogModule],
  templateUrl: './branchdeactivatewarning.component.html',
  styleUrl: './branchdeactivatewarning.component.css'
})

export class BranchdeactivatewarningComponent {
  constructor(public dialogRef: MatDialogRef<BranchdeactivatewarningComponent>) {}

  onClose(): void {
    this.dialogRef.close(false);
  }

  onActivate(): void {
    this.dialogRef.close(true);
  }
}
